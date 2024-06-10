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
  Products,
  RemovedTransaction,
  Transaction,
  TransactionsGetRequest,
  TransactionsSyncRequest,
} from 'plaid';

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || PlaidEnvironments.sandbox;
const PLAID_PRODUCTS = (
  process.env.PLAID_PRODUCTS || Products.Transactions
).split(',');
const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'US').split(
  ','
);
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || '';
const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
      'Plaid-Version': '2020-09-14',
    },
  },
});
const plaidClient = new PlaidApi(configuration);

export async function createLinkToken(userId: string) {
  const request = {
    user: {
      client_user_id: userId,
    },
    client_name: 'Plaid Test App',
    products: [Products.Transactions],
    language: 'en',
    webhook: process.env.BASE_URL + '/api/plaid/webhook',
    // webhook: 'https://webhook.site/7bad17f5-f541-4daf-8871-0ca9ff4b3649',
    country_codes: [CountryCode.Us],
  };
  const createTokenResponse = await plaidClient.linkTokenCreate(request);
  revalidatePath('/');
  return createTokenResponse.data;
}

export async function exchangePublicToken(publicToken: string, userId: string) {
  const exchangeTokenResponse = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });

  const accessToken = exchangeTokenResponse.data.access_token;
  const itemId = exchangeTokenResponse.data.item_id;
  const itemResponse = await plaidClient.itemGet({
    access_token: accessToken,
  });
  const institutionId = itemResponse.data.item.institution_id;
  if (!institutionId) return false;

  await db.plaidItem.create({
    data: {
      institutionId,
      accessToken,
      itemId,
      userId,
      updatedAt: new Date(),
    },
  });

  revalidatePath('/');
  revalidatePath('/user');
  revalidatePath('/review');
  revalidatePath('/transactions');
  return true;
}

export async function syncItems(userId: string) {
  const plaidItems = await db.plaidItem.findMany({
    where: {
      userId,
    },
  });
  await getRecurringTransactions(userId);
  await Promise.all(plaidItems.map((plaidItem) => syncTransactions(plaidItem)));

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

export async function getUnreadTransactionsAndAccounts(userId: string) {
  const plaidItems = await db.plaidItem.findMany({
    where: {
      userId,
    },
  });

  if (!plaidItems) {
    throw new Error('Plaid item not found');
  }

  const unreadTransactions = await db.transaction.findMany({
    where: {
      userId,
      unread: true,
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

  await db.plaidItem.update({
    where: {
      id: plaidItem.id,
    },
    data: {
      cursor: allData.nextCursor,
      updatedAt: new Date(),
    },
  });

  await db.transaction.createMany({
    data: addedTransactions.map((transaction) => ({
      userId: plaidItem.userId,
      accountId: transaction.account_id,
      transactionId: transaction.transaction_id,
      institutionId: plaidItem.institutionId,
      amount: transaction.amount,
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
    })),
  });

  await Promise.all(
    modifiedTransactions.map(async (transaction) => {
      await db.transaction.update({
        where: {
          transactionId: transaction.transaction_id,
        },
        data: {
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
      unread: true,
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
      unread: false,
    },
    data: {
      unread: true,
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
    data: { unread: false, rating, impulse },
  });
  revalidatePath('/');
}

export async function removeAllPlaidItems(userId: string) {
  const plaidItems = await db.plaidItem.findMany({
    where: { institutionId: userId },
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
    where: { institutionId: userId },
  });

  revalidatePath('/');
  revalidatePath('/user');
  revalidatePath('/onboarding');
  return true;
}
export async function removePlaidItem(id: string) {
  const plaidItem = await db.plaidItem.findFirst({
    where: { institutionId: id },
  });

  if (!plaidItem) {
    return false;
  }

  await plaidClient.itemRemove({
    access_token: plaidItem.accessToken,
  });

  await db.plaidItem.delete({
    where: { institutionId: id },
  });

  revalidatePath('/');
  revalidatePath('/user');
  return true;
}

export type ItemData = {
  institution?: Institution;
  accounts: AccountBase[];
};
export async function getAllLinkedItems(userId: string): Promise<ItemData[]> {
  const itemsMeta = await db.plaidItem.findMany({
    where: {
      userId,
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
      const accountResponse = await plaidClient.accountsGet({
        access_token: item.accessToken,
      });
      const plaidItem = items.find((x) => x.item_id === item.itemId);
      let institution: Institution | undefined = undefined;
      if (plaidItem)
        institution = await getInstitutionById(plaidItem.institution_id!);
      return { institution, accounts: accountResponse.data.accounts };
    })
  );

  return itemsData;
}

export async function getRecurringTransactions(userId: string) {
  const plaidItems = await db.plaidItem.findMany({
    where: {
      userId,
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
