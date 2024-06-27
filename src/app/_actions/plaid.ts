'use server';

import db from '@/db/db';
import {
  UnreadCountObject,
  discretionaryFilter,
  plaidCategories,
} from '@/lib/plaid';
import {
  Account,
  PlaidItem,
  Prisma,
  Transaction as PrismaTransaction,
} from '@prisma/client';
import { format, formatDistanceToNow, formatRelative, isToday } from 'date-fns';
import { revalidatePath } from 'next/cache';

import {
  Configuration,
  CountryCode,
  Institution,
  InstitutionsGetByIdRequest,
  LinkTokenCreateRequest,
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
  const request: LinkTokenCreateRequest = {
    user: {
      client_user_id: userId,
    },
    access_token,
    client_name: 'Plaid Test App',
    products: [Products.Transactions],
    language: 'en',
    transactions: {
      days_requested: 180,
    },
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
  if (!overrideExistingCheck) {
    for (let i = 0; i < metadata.accounts.length; i++) {
      const account = metadata.accounts[i];
      for (let j = 0; j < accounts.length; j++) {
        const a = accounts[j];
        if (
          a.institutionId === institutionId &&
          accounts.some(
            (b) => b.name === account.name && b.mask === account.mask
          )
        ) {
          return { duplicate: true };
        }
      }
      if (accounts.some((a) => a.institutionId === institutionId)) {
        return { existingInstitution: true };
      }
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

  await Promise.all(
    metadata.accounts.map(async (account) =>
      db.account.upsert({
        where: {
          id: account.id,
        },
        update: {
          accessToken,
          mask: account.mask,
          name: account.name,
          type: account.type,
          subtype: account.subtype,
        },
        create: {
          userId,
          accessToken,
          id: account.id,
          mask: account.mask,
          name: account.name,
          type: account.type,
          subtype: account.subtype,
          institutionId: institutionId,
          plaidItemId: itemId,
        },
      })
    )
  );

  revalidatePath('/');
  revalidatePath('/user');
  revalidatePath('/review');
  revalidatePath('/log/transactions');
  return { duplicate: false, existingInstitution: false };
}

export async function syncItems(userId: string) {
  const plaidItems = await db.plaidItem.findMany({
    where: {
      userId,
      loginRequired: false,
      deletedAt: null,
    },
  });
  await Promise.all(plaidItems.map((plaidItem) => syncTransactions(plaidItem)));
  await getRecurringTransactions(userId);

  revalidatePath('/');
  revalidatePath('/log/transactions');
  revalidatePath('/review');
  return true;
}

export async function getUserItems(userId: string) {
  const items = await db.plaidItem.findMany({
    where: {
      userId,
      loginRequired: false,
      deletedAt: null,
    },
  });

  return items;
}

export async function getOlderTransactions(userId: string, days: number) {
  const oldestTransaction = await db.transaction.findFirst({
    where: {
      userId,
    },
    orderBy: {
      date: 'asc',
    },
  });

  if (!oldestTransaction) {
    return [];
  }

  const oldestDate = oldestTransaction.date;
  const currentDate = new Date();
  const startDate = new Date(oldestDate);
  startDate.setDate(startDate.getDate() - days);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);

  const plaidItems = await db.plaidItem.findMany({
    where: {
      userId,
      loginRequired: false,
      deletedAt: null,
    },
  });

  if (!plaidItems) {
    throw new Error('Plaid item not found');
  }

  await Promise.all(
    plaidItems.map((plaidItem) =>
      getItemTransactions(
        plaidItem,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )
    )
  );
  console.log('completed fetching transactions');
}

export async function getItemTransactions(
  plaidItem: PlaidItem,
  start_date: string,
  end_date: string
) {
  const request: TransactionsGetRequest = {
    access_token: plaidItem.accessToken,
    start_date,
    end_date,
  };
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

  await Promise.all(
    transactions.map(async (transaction) => {
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
          read: false,
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
  const accounts = await db.account.findMany({
    where: {
      userId,
    },
  });

  return accounts;
}

export type FormattedTransaction = {
  id: string;
  name: string;
  merchantName: string;
  amount: number;
  category: string;
  plaidCategory: string;
  accountName: string;
  accountMask: string;
  read: boolean;
  impulse: boolean;
  recurring: boolean;
  date: Date;
  personalFinanceCategory: PersonalFinanceCategory;
  friendlyDistanceDate: string;
  friendlyRelativeDate: string;
  formattedDate: string;
};
export type PersonalFinanceCategory = {
  confidence_level: string;
  detailed: string;
  primary: string;
};
export async function getFormattedTransactions(userId: string, read?: boolean) {
  const plaidItems = await db.plaidItem.findMany({
    where: {
      userId,
      loginRequired: false,
      deletedAt: null,
    },
  });

  if (!plaidItems) {
    throw new Error('Plaid item not found');
  }

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      read,
    },
    orderBy: {
      date: 'asc',
    },
  });

  const accounts = await db.account.findMany({
    where: {
      userId,
    },
  });
  const categories = plaidCategories;
  const formattedTransactions = transactions
    .sort(sortTransactionDateDesc)
    .map((transaction): FormattedTransaction => {
      const account = accounts.find(
        (account) => account.id === transaction.accountId
      );

      const personalFinanceCategory =
        transaction.personalFinanceCategory as PersonalFinanceCategory;
      const plaidCategory = personalFinanceCategory?.primary ?? '';
      const category =
        categories.find((cat) => cat.value === plaidCategory)?.label ?? '';

      const date = transaction.authorizedDate ?? transaction.date;
      return {
        id: transaction.transactionId,
        date,
        read: transaction.read,
        personalFinanceCategory,
        impulse: transaction.impulse ?? false,
        recurring: transaction.recurring,
        formattedDate: isToday(date)
          ? 'TODAY'
          : format(transaction.date, 'EEE, MMMM dd').toUpperCase(),
        friendlyDistanceDate: formatDistanceToNow(date, {
          addSuffix: true,
        }),
        name: transaction.name,
        friendlyRelativeDate: formatRelative(date, new Date()),
        merchantName: transaction.merchantName ?? '',
        amount: parseFloat(transaction.amount.toFixed(2)),
        category,
        plaidCategory,

        accountName: account?.name ?? '',
        accountMask: account?.mask ?? '',
      };
    });

  return formattedTransactions;
}

function sortTransactionDateDesc(a: PrismaTransaction, b: PrismaTransaction) {
  if (a.date < b.date) {
    return 1;
  }
  if (a.date > b.date) {
    return -1;
  }
  return 0;
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
    accessToken: string;
    nextCursor: string | null;
  } = {
    added: [],
    modified: [],
    removed: [],
    accessToken,
    nextCursor: cursor,
  };

  try {
    do {
      const request: TransactionsSyncRequest = {
        access_token: accessToken,
        cursor: allData.nextCursor ?? undefined,
        options: {
          include_personal_finance_category: true,
          days_requested: 180,
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
  const weekAgo = new Date(currentDate);
  weekAgo.setDate(currentDate.getDate() - 7);

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
      lastSync: new Date(),
      updatedAt: new Date(),
    },
  });

  await Promise.all(
    combinedTransactions.map(async (transaction) => {
      const date = transaction.authorized_date ?? transaction.date;
      const read =
        new Date(date) < weekAgo ||
        !discretionaryFilter({
          personalFinanceCategory: transaction.personal_finance_category,
          recurring: false,
        });

      await db.transaction.upsert({
        where: { transactionId: transaction.transaction_id },
        update: {
          accountId: transaction.account_id,
          amount: transaction.amount,
          name: transaction.name,
          isoCurrencyCode: transaction.iso_currency_code,
          paymentChannel: transaction.payment_channel,
          pending: transaction.pending,

          authorizedDate: transaction.authorized_date
            ? new Date(transaction.authorized_date)
            : null,
          date: new Date(transaction.date),
          dateTime: transaction.datetime,
          authorizedDateTime: transaction.authorized_datetime,

          pendingTransactionId: transaction.pending_transaction_id,
          merchantName: transaction.merchant_name,
          personalFinanceCategoryIcon:
            transaction.personal_finance_category_icon_url,
          location: transaction.location as unknown as Prisma.InputJsonObject,
          paymentMeta:
            transaction.payment_meta as unknown as Prisma.InputJsonObject,
        },
        create: {
          userId: plaidItem.userId,
          read,
          accountId: transaction.account_id,
          transactionId: transaction.transaction_id,
          institutionId: plaidItem.institutionId,
          amount: transaction.amount,
          plaidItemId: plaidItem.itemId,
          name: transaction.name,
          pending: transaction.pending,

          authorizedDate: transaction.authorized_date
            ? new Date(transaction.authorized_date)
            : null,
          date: new Date(transaction.date),
          dateTime: transaction.datetime,
          authorizedDateTime: transaction.authorized_datetime,

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
  revalidatePath('/log/transactions');
  revalidatePath('/review');

  return allData;
}

export async function refreshUserItems(userId: string) {
  const plaidItems = await db.plaidItem.findMany({
    where: {
      userId,
      loginRequired: false,
      deletedAt: null,
    },
  });

  if (!plaidItems) {
    throw new Error('Plaid item not found');
  }
  let allItemsData: {
    added: Transaction[];
    modified: Transaction[];
    removed: RemovedTransaction[];
    nextCursor: string | null;
  }[] = [];
  try {
    await Promise.all(plaidItems.map((plaidItem) => refreshItem(plaidItem)));
    allItemsData = await Promise.all(
      plaidItems.map((plaidItem) => syncTransactions(plaidItem))
    );
    await getRecurringTransactions(userId);
  } catch (e) {
    console.error('Error refreshing items. Could be login required.');
    console.error(e);
  }

  await Promise.all(
    plaidItems.map((plaidItem, index) => {
      const itemData = allItemsData[index];
      return db.plaidItem.update({
        where: {
          accessToken: plaidItem.accessToken,
        },
        data: {
          cursor: itemData.nextCursor,
          lastSync: new Date(),
          lastRefresh: new Date(),
          updatedAt: new Date(),
        },
      });
    })
  );

  // check if there were any changes from the sync
  const changes = allItemsData.some(
    (data) =>
      data.added.length > 0 ||
      data.modified.length > 0 ||
      data.removed.length > 0
  );
  revalidatePath('/');
  revalidatePath('/log/transactions');
  revalidatePath('/review');
  return {
    changes,
  };
}

export async function getNextRefreshTime(userId: string) {
  const plaidItems = await db.plaidItem.findMany({
    where: {
      userId,
      loginRequired: false,
      deletedAt: null,
      lastRefresh: {
        not: null,
      },
    },
  });

  if (!plaidItems) {
    throw new Error('Plaid item not found');
  }
  if (plaidItems.length === 0) {
    return null;
  }

  // get the oldest last refresh date
  const oldestItem = plaidItems.reduce((prev, current) =>
    prev.lastRefresh! < current.lastRefresh! ? prev : current
  );

  // next refresh is 12 hours after the oldest last refresh
  if (oldestItem.lastRefresh) {
    const nextRefresh = new Date();
    nextRefresh.setHours(oldestItem.lastRefresh.getHours() + 12);
    return nextRefresh;
  }

  return null;
}

async function refreshItem(plaidItem: PlaidItem) {
  const response = await plaidClient.transactionsRefresh({
    access_token: plaidItem.accessToken,
  });

  return response.data.request_id;
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

export async function markAllTransactionsAsRead(userId: string, read = true) {
  const results = await db.transaction.updateMany({
    where: {
      userId,
      read: !read,
    },
    data: {
      read,
      updatedAt: new Date(),
    },
  });
  revalidatePath('/review');
  revalidatePath('/log/transactions');
}

export async function markTransactionAsRead(
  id: string,
  impulse: boolean,
  rating?: number
) {
  const transaction = await db.transaction.findFirst({
    where: { transactionId: id },
  });
  await db.transaction.update({
    where: { transactionId: id },
    data: { read: true, rating, impulse },
  });
  if (transaction && transaction.amount.toNumber() < 0 && impulse) {
    const pinnedGoal = await db.goal.findFirst({
      where: { userId: transaction?.userId, pinned: true },
    });
    let pinnedGoalId = pinnedGoal?.id;
    await db.goalTransfer.create({
      data: {
        amount: transaction?.amount.toNumber() * -1,
        goalId: pinnedGoalId,
        itemName: transaction?.name ?? '',
        userId: transaction?.userId,
        plaidCategory:
          (transaction?.personalFinanceCategory as any)?.primary ?? '',
      },
    });
  }
  revalidatePath('/');
  revalidatePath('/log/transactions');
}

export async function removeAllPlaidItems(userId: string) {
  const plaidItems = await db.plaidItem.findMany({
    where: { userId: userId, deletedAt: null },
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

  await db.plaidItem.updateMany({
    where: { userId },
    data: {
      deletedAt: new Date(),
    },
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
  await db.account.deleteMany({
    where: { plaidItemId: plaidItem.itemId },
  });
  await db.plaidItem.update({
    where: { itemId: plaidItem.itemId },
    data: {
      deletedAt: new Date(),
    },
  });

  revalidatePath('/');
  revalidatePath('/user');
  return true;
}

export type ItemData = {
  institution?: Institution;
  linkToken: string;
  linkText: string;
  accounts: Account[];
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
      let linkToken = '';
      try {
        linkToken = (await createLinkToken(userId, item.accessToken))
          .link_token;

        const accounts = await db.account.findMany({
          where: { accessToken: item.accessToken },
        });
        const plaidItem = items.find((x) => x.item_id === item.itemId);
        let institution: Institution | undefined = undefined;
        if (plaidItem)
          institution = await getInstitutionById(plaidItem.institution_id!);
        return {
          linkToken,
          institution,
          linkText: 'Reselect Accounts',
          itemId: item.itemId,
          accounts,
        };
      } catch (e) {
        console.error(e);
        console.log('Error creating link token. Could be login required');
        return {
          linkToken,
          linkText: 'Login required',
          institution: undefined,
          itemId: item.itemId,
          accounts: [],
        };
      }
    })
  );

  return itemsData;
}

export async function getRecurringTransactions(userId: string) {
  const plaidItems = await db.plaidItem.findMany({
    where: {
      userId,
      loginRequired: false,
      deletedAt: null,
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
            read: true,
          },
        });
      } catch (en) {
        console.error(en);
      }
    })
  );

  revalidatePath('/');
  revalidatePath('/log/transactions');
  revalidatePath('/review');
  return true;
}

export const getUnreadTransactionCount = async (
  userId: string
): Promise<UnreadCountObject> => {
  const unreadTransactions = await db.transaction.findMany({
    where: {
      userId,
      read: false,
      // recurring: false,
    },
  });
  const plaidItem = await db.plaidItem.findFirst({
    where: {
      userId,
      loginRequired: false,
      deletedAt: null,
    },
  });
  return {
    unreadCount: unreadTransactions.filter(discretionaryFilter).length,
    plaidItemExist: plaidItem !== null,
  };
};
