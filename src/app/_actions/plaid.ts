'use server';

import db from '@/db/db';
import { PlaidItem, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import {
  AccountBase,
  Configuration,
  CountryCode,
  Institution,
  InstitutionsGetByIdRequest,
  PlaidApi,
  PlaidEnvironments,
  PlaidError,
  Products,
  RemovedTransaction,
  Transaction,
  TransactionsGetRequest,
  TransactionsSyncRequest,
} from 'plaid';
import { PlaidLinkOnSuccessMetadata } from 'react-plaid-link';

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;

if (!process.env.PLAID_ENV)
  console.log('PLAID_ENV not set, defaulting to sandbox');
// options are 'sandbox', 'development', 'production'
let plaidEnv = process.env.PLAID_ENV ?? 'sandbox';
const PLAID_PRODUCTS = (
  process.env.PLAID_PRODUCTS || Products.Transactions
).split(',');
const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'US').split(
  ','
);

const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || '';
const configuration = new Configuration({
  basePath: PlaidEnvironments[plaidEnv],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export async function checkPlaidItemStatus(
  plaidItem: PlaidItem
): Promise<{ status: string; error: string | null }> {
  try {
    // Get item status from Plaid
    const itemResponse = await plaidClient.itemGet({
      access_token: plaidItem.accessToken,
    });

    // Check for ITEM_LOGIN_REQUIRED error
    const statusError = itemResponse.data.item.error;
    if (statusError) {
      if (statusError.error_code === 'ITEM_LOGIN_REQUIRED') {
        return {
          status: statusError.error_code,
          error: statusError.error_message,
        };
      }
    }

    // Check for PENDING_EXPIRATION webhook
    if (itemResponse.data.item.webhook === 'PENDING_EXPIRATION') {
      return { status: 'pending_expiration', error: null };
    }

    // If no specific error, return item status
    return { status: 'active', error: null };
  } catch (error) {
    const plaidError = error as PlaidError;
    return { status: 'error', error: plaidError.error_message };
  }
}

export async function createLinkToken(userId: string, access_token?: string) {
  const request = {
    user: {
      client_user_id: userId,
    },
    access_token,
    client_name: 'Plaid Test App',
    products: [Products.Transactions],
    language: 'en',
    webhook: process.env.BASE_URL + '/api/plaid/webhook',
    country_codes: [CountryCode.Us],
  };
  const createTokenResponse = await plaidClient.linkTokenCreate(request);
  return createTokenResponse.data;
}

export async function exchangePublicToken(
  publicToken: string,
  metadata: PlaidLinkOnSuccessMetadata,
  userId: string,
  overrideExistingCheck = false
) {
  const accounts = await getAllUserAccounts(userId);
  const institutionId = metadata.institution?.institution_id;
  if (!institutionId) throw new Error('Institution ID not found');
  for (let i = 0; i < metadata.accounts.length; i++) {
    const account = metadata.accounts[i];
    for (let j = 0; j < accounts.length; j++) {
      const a = accounts[j];
      if (
        a.item.institution_id === institutionId &&
        a.accounts.some(
          (b) => b.name === account.name && b.mask === account.mask
        )
      ) {
        return { duplicate: true };
      }
    }
    if (
      accounts.some((a) => a.item.institution_id === institutionId) &&
      !overrideExistingCheck
    ) {
      return { existingInstitution: true };
    }
  }

  const exchangeTokenResponse = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });

  const accessToken = exchangeTokenResponse.data.access_token;
  const itemId = exchangeTokenResponse.data.item_id;
  const itemResponse = await plaidClient.itemGet({
    access_token: accessToken,
  });

  await db.plaidItem.upsert({
    where: {
      itemId,
    },
    update: {
      accessToken,
      institutionId,
      updatedAt: new Date(),
    },
    create: {
      userId,
      institutionId,
      accessToken,
      itemId,
      updatedAt: new Date(),
    },
  });

  revalidatePath('/');
  revalidatePath('/user');
  revalidatePath('/review');
  revalidatePath('/transactions');
  return { duplicate: false, existingInstitution: false };
}

export async function syncItems(userId: string) {
  const plaidItems = await db.plaidItem.findMany({
    where: {
      userId,
      loginRequired: false,
    },
  });
  await Promise.all(plaidItems.map((plaidItem) => syncTransactions(plaidItem)));
  await getRecurringTransactions(userId);

  revalidatePath('/');
  revalidatePath('/transactions');
  revalidatePath('/review');
  return true;
}

export async function getTransactions(
  userId: string,
  start_date: string,
  end_date: string
) {
  const plaidItem = await db.plaidItem.findFirst({
    where: {
      userId,
      loginRequired: false,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  if (!plaidItem) {
    return [];
  }

  const request: TransactionsGetRequest = {
    access_token: plaidItem.accessToken,
    start_date,
    end_date,
  };
  try {
    const response = await plaidClient.transactionsGet(request);
    let transactions = response.data.transactions;
    const total_transactions = response.data.total_transactions;
    while (transactions.length < total_transactions) {
      const paginatedRequest: TransactionsGetRequest = {
        access_token: plaidItem.accessToken,
        start_date,
        end_date,
        options: {
          offset: transactions.length,
        },
      };
      const paginatedResponse = await plaidClient.transactionsGet(
        paginatedRequest
      );
      transactions = transactions.concat(paginatedResponse.data.transactions);
    }

    return transactions;
  } catch (error) {
    // console.error('Error fetching transactions:', error);
    throw error;
  }
}
const currentInstitutions = new Map<string, Institution>();
export async function getInstitutionById(institutionId: string) {
  if (currentInstitutions.has(institutionId)) {
    return currentInstitutions.get(institutionId)!;
  }

  const request: InstitutionsGetByIdRequest = {
    institution_id: institutionId,
    options: {
      include_optional_metadata: true,
    },
    country_codes: [CountryCode.Us],
  };

  const response = await plaidClient.institutionsGetById(request);
  currentInstitutions.set(institutionId, response.data.institution);
  return response.data.institution;
}

async function getAllUserAccounts(userId: string) {
  const plaidItems = await db.plaidItem.findMany({
    where: {
      userId,
      loginRequired: false,
    },
  });

  if (!plaidItems) {
    throw new Error('Plaid item not found');
  }

  const accounts = await Promise.all(
    plaidItems.map(
      async (plaidItem) =>
        (
          await plaidClient.accountsGet({
            access_token: plaidItem.accessToken,
          })
        ).data
    )
  );

  return accounts;
}

export async function getUnreadTransactionsAndAccounts(userId: string) {
  const plaidItems = await db.plaidItem.findMany({
    where: {
      userId,
      loginRequired: false,
    },
  });

  if (!plaidItems) {
    throw new Error('Plaid item not found');
  }

  const unreadTransactions = await db.transaction.findMany({
    where: {
      userId,
      read: false,
      recurring: false,
    },
    orderBy: {
      date: 'asc',
    },
  });

  const groupedAccounts = await Promise.all(
    plaidItems.map(
      async (plaidItem) =>
        (
          await plaidClient.accountsGet({
            access_token: plaidItem.accessToken,
          })
        ).data.accounts
    )
  );
  const accounts = groupedAccounts.flat();

  const items = await Promise.all(
    plaidItems.map(
      async (plaidItem) =>
        (
          await plaidClient.itemGet({
            access_token: plaidItem.accessToken,
          })
        ).data.item
    )
  );
  const institutions = await Promise.all(
    items
      .filter((item) => item.institution_id)
      .map(async (item) => await getInstitutionById(item.institution_id!))
  );

  const formattedTransactions = unreadTransactions.map((transaction) =>
    Object.assign(transaction, {
      amount: parseFloat(transaction.amount.toFixed(2)),
    })
  );

  return {
    items,
    accounts,
    institutions,
    unreadTransactions: formattedTransactions,
  };
}

async function fetchAllSyncData(
  accessToken: string,
  cursor: string | null,
  retriesLeft = 3
) {
  let keepGoing = false;
  const allData: {
    added: Transaction[];
    modified: Transaction[];
    removed: RemovedTransaction[];
    nextCursor: string | null;
  } = {
    added: [],
    modified: [],
    removed: [],
    nextCursor: cursor,
  };

  try {
    do {
      const request: TransactionsSyncRequest = {
        access_token: accessToken,
        cursor: allData.nextCursor ?? undefined,
        options: {
          include_personal_finance_category: true,
        },
      };

      const transactionsResponse = await plaidClient.transactionsSync(request);

      allData.added = allData.added.concat(transactionsResponse.data.added);
      allData.modified = allData.modified.concat(
        transactionsResponse.data.modified
      );
      allData.removed = allData.removed.concat(
        transactionsResponse.data.removed
      );
      allData.nextCursor = transactionsResponse.data.next_cursor;
      keepGoing = transactionsResponse.data.has_more;
    } while (keepGoing);

    return allData;
  } catch (e) {
    await setTimeout(() => {}, 1000);
    if (retriesLeft === 0) throw e;
    return fetchAllSyncData(accessToken, cursor, retriesLeft - 1);
  }
}

export async function syncTransactions(plaidItem: PlaidItem) {
  if (!plaidItem) {
    throw new Error('Plaid item not found');
  }

  const currentDate = new Date();
  const threeDaysAgo = new Date(currentDate);
  threeDaysAgo.setDate(currentDate.getDate() - 3);

  const startDate = plaidItem.cursor
    ? undefined
    : threeDaysAgo.toISOString().split('T')[0];
  const endDate = currentDate.toISOString().split('T')[0];

  const request: TransactionsSyncRequest = {
    access_token: plaidItem.accessToken,
    options: {
      include_personal_finance_category: true,
    },
  };

  if (plaidItem.cursor) {
    request.cursor = plaidItem.cursor;
  }

  const allData = await fetchAllSyncData(
    plaidItem.accessToken,
    plaidItem.cursor
  );

  const addedTransactions = allData.added;
  const modifiedTransactions = allData.modified;
  const removedTransactions = allData.removed;
  const combinedTransactions = [...addedTransactions, ...modifiedTransactions];

  await db.plaidItem.update({
    where: {
      id: plaidItem.id,
    },
    data: {
      cursor: allData.nextCursor,
      updatedAt: new Date(),
    },
  });

  await Promise.all(
    combinedTransactions.map(async (transaction) => {
      await db.transaction.upsert({
        where: { transactionId: transaction.transaction_id },
        update: {
          accountId: transaction.account_id,
          amount: transaction.amount,
          date: new Date(transaction.date),
          name: transaction.name,
          isoCurrencyCode: transaction.iso_currency_code,
          paymentChannel: transaction.payment_channel,
          pending: transaction.pending,
          pendingTransactionId: transaction.pending_transaction_id,
          merchantName: transaction.merchant_name,
          personalFinanceCategoryIcon:
            transaction.personal_finance_category_icon_url,
          location: transaction.location as unknown as Prisma.InputJsonObject,
          personalFinanceCategory:
            transaction.personal_finance_category as unknown as Prisma.InputJsonObject,
          paymentMeta:
            transaction.payment_meta as unknown as Prisma.InputJsonObject,
        },
        create: {
          userId: plaidItem.userId,
          accountId: transaction.account_id,
          transactionId: transaction.transaction_id,
          institutionId: plaidItem.institutionId,
          amount: transaction.amount,
          plaidItemId: plaidItem.itemId,
          name: transaction.name,
          pending: transaction.pending,
          date: new Date(transaction.date),
          merchantName: transaction.merchant_name,
          paymentChannel: transaction.payment_channel,
          isoCurrencyCode: transaction.iso_currency_code,
          pendingTransactionId: transaction.pending_transaction_id,
          personalFinanceCategoryIcon:
            transaction.personal_finance_category_icon_url,
          location: transaction.location as unknown as Prisma.InputJsonObject,
          personalFinanceCategory:
            transaction.personal_finance_category as unknown as Prisma.InputJsonObject,
          paymentMeta:
            transaction.payment_meta as unknown as Prisma.InputJsonObject,
        },
      });
    })
  );

  await Promise.all(
    removedTransactions.map(async (transaction) => {
      await db.transaction.delete({
        where: {
          transactionId: transaction.transaction_id,
        },
      });
    })
  );

  revalidatePath('/');
  revalidatePath('/transactions');
  revalidatePath('/review');
}

export async function getUnreadTransactions(userId: string) {
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      read: false,
      recurring: false,
    },
    orderBy: {
      date: 'desc',
    },
  });

  return transactions.map((transaction) =>
    Object.assign(transaction, {
      amount: parseFloat(transaction.amount.toFixed(2)),
    })
  );
}

export async function markAllTransactionsAsUnread(userId: string) {
  await db.transaction.updateMany({
    where: {
      userId,
      read: true,
    },
    data: {
      read: false,
      updatedAt: new Date(),
    },
  });
  revalidatePath('/transactions/review');
}

export async function markTransactionAsRead(
  id: string,
  impulse: boolean,
  rating?: number
) {
  await db.transaction.update({
    where: { id },
    data: { read: true, rating, impulse },
  });
  revalidatePath('/');
}

export async function removeAllPlaidItems(userId: string) {
  const plaidItems = await db.plaidItem.findMany({
    where: { userId: userId },
  });

  if (!plaidItems || plaidItems.length === 0) {
    return false;
  }

  await Promise.all(
    plaidItems.map(async (item) => {
      await plaidClient.itemRemove({
        access_token: item.accessToken,
      });
    })
  );

  await db.plaidItem.deleteMany({
    where: { userId },
  });

  revalidatePath('/');
  revalidatePath('/user');
  revalidatePath('/onboarding');
  return true;
}

export async function handleLoginExpiration(
  plaidItem: PlaidItem,
  loginRequired: boolean
) {
  await db.plaidItem.update({
    where: {
      id: plaidItem.id,
    },
    data: {
      loginRequired,
      updatedAt: new Date(),
    },
  });
}

export async function handleUserPermissionRevoked(plaidItem: PlaidItem) {
  removePlaidItem(plaidItem.itemId);

  revalidatePath('/');
  revalidatePath('/user');
}

export async function removePlaidItem(itemId: string) {
  const plaidItem = await db.plaidItem.findFirst({
    where: { itemId },
  });

  if (!plaidItem) {
    return false;
  }

  await plaidClient.itemRemove({
    access_token: plaidItem.accessToken,
  });

  await db.transaction.deleteMany({
    where: { plaidItemId: plaidItem.itemId },
  });
  await db.plaidItem.delete({
    where: { itemId: plaidItem.itemId },
  });

  revalidatePath('/');
  revalidatePath('/user');
  return true;
}

export type ItemData = {
  institution?: Institution;
  linkToken: string;
  linkText: string;
  accounts: AccountBase[];
  itemId: string;
};
export async function getAllLinkedItems(userId: string): Promise<ItemData[]> {
  const itemsMeta = await db.plaidItem.findMany({
    where: {
      userId,
      loginRequired: false,
      deletedAt: null,
    },
  });

  const items = await Promise.all(
    itemsMeta.map(async (item) => {
      const itemResponse = await plaidClient.itemGet({
        access_token: item.accessToken,
      });

      return itemResponse.data.item;
    })
  );
  const itemsData = await Promise.all(
    itemsMeta.map(async (item) => {
      const status = await checkPlaidItemStatus(item);
      const linkToken = (await createLinkToken(userId, item.accessToken))
        .link_token;
      if (status.status === 'ITEM_LOGIN_REQUIRED') {
        return {
          linkToken,
          linkText: 'Login required',
          institution: undefined,
          itemId: item.itemId,
          accounts: [],
        };
      }
      const accountResponse = await plaidClient.accountsGet({
        access_token: item.accessToken,
      });
      const plaidItem = items.find((x) => x.item_id === item.itemId);
      let institution: Institution | undefined = undefined;
      if (plaidItem)
        institution = await getInstitutionById(plaidItem.institution_id!);
      return {
        linkToken,
        institution,
        linkText: 'Reselect accounts',
        itemId: item.itemId,
        accounts: accountResponse.data.accounts,
      };
    })
  );

  return itemsData;
}

export async function getRecurringTransactions(userId: string) {
  const plaidItems = await db.plaidItem.findMany({
    where: {
      userId,
      loginRequired: false,
    },
  });

  if (!plaidItems) {
    throw new Error('Plaid item not found');
  }

  const recurringStreams = await Promise.all(
    plaidItems.map(async (plaidItem) => {
      const request = {
        access_token: plaidItem.accessToken,
      };
      const response = await plaidClient.transactionsRecurringGet(request);
      return [
        ...response.data.inflow_streams,
        ...response.data.outflow_streams,
      ];
    })
  );
  const allRecurringTransactionsIds = recurringStreams
    .flat()
    .map((stream) => stream.transaction_ids)
    .flat();

  await Promise.all(
    allRecurringTransactionsIds.map(async (transactionId) => {
      try {
        await db.transaction.update({
          where: {
            transactionId: transactionId,
          },
          data: {
            recurring: true,
          },
        });
      } catch (en) {
        console.error(en);
      }
    })
  );

  revalidatePath('/');
  revalidatePath('/transactions');
  revalidatePath('/review');
  return true;
}
