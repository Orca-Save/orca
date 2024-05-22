'use server';

import db from '@/db/db';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import {
  Configuration,
  CountryCode,
  InstitutionsGetByIdRequest,
  PlaidApi,
  PlaidEnvironments,
  Products,
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
    webhook: 'https://webhook.example.com',
    // redirect_uri: 'https://domainname.com/oauth-page.html',
    country_codes: [CountryCode.Us],
  };
  const createTokenResponse = await plaidClient.linkTokenCreate(request);
  return createTokenResponse.data;
}

export async function exchangePublicToken(publicToken: string, userId: string) {
  const exchangeTokenResponse = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });

  const accessToken = exchangeTokenResponse.data.access_token;
  const itemId = exchangeTokenResponse.data.item_id;

  await db.plaidItem.create({
    data: {
      accessToken,
      itemId,
      userId,
      updatedAt: new Date(),
    },
  });
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
export async function getInstitutionById(institutionId: string) {
  const request: InstitutionsGetByIdRequest = {
    institution_id: institutionId,
    options: {
      include_optional_metadata: true,
    },
    country_codes: [CountryCode.Us],
  };

  const response = await plaidClient.institutionsGetById(request);
  return response.data.institution;
}

export async function getUnreadTransactionsAndAccounts(userId: string) {
  const plaidItem = await db.plaidItem.findFirst({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  if (!plaidItem) {
    throw new Error('Plaid item not found');
  }

  const [unreadTransactions, accountsResponse, itemResponse] =
    await Promise.all([
      db.transaction.findMany({
        where: {
          userId,
          unread: true,
        },
        orderBy: {
          date: 'desc',
        },
      }),
      plaidClient.accountsGet({
        access_token: plaidItem.accessToken,
      }),
      plaidClient.itemGet({
        access_token: plaidItem.accessToken,
      }),
    ]);

  const institutionId = itemResponse.data.item.institution_id;
  const institution = institutionId
    ? await getInstitutionById(institutionId)
    : null;

  const formattedTransactions = unreadTransactions.map((transaction) => ({
    ...transaction,
    amount: parseFloat(transaction.amount.toFixed(2)),
  }));

  return {
    unreadTransactions: formattedTransactions,
    accounts: accountsResponse.data.accounts,
    item: itemResponse.data.item,
    institution,
  };
}

export async function syncTransactions(userId: string) {
  const plaidItem = await db.plaidItem.findFirst({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

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

  const transactionsResponse = await plaidClient.transactionsSync(request);

  const addedTransactions = transactionsResponse.data.added;
  const modifiedTransactions = transactionsResponse.data.modified;
  const removedTransactions = transactionsResponse.data.removed;
  const newCursor = transactionsResponse.data.next_cursor;

  await db.transaction.createMany({
    data: addedTransactions.map((transaction) => ({
      userId,
      accountId: transaction.account_id,
      transactionId: transaction.transaction_id,
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

  await db.plaidItem.update({
    where: {
      id: plaidItem.id,
    },
    data: {
      cursor: newCursor,
      updatedAt: new Date(),
    },
  });

  revalidatePath('/');
  revalidatePath('/transactions');
  revalidatePath('/transactions/review');
}

export async function getUnreadTransactions(userId: string) {
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      unread: true,
    },
    orderBy: {
      date: 'desc',
    },
  });

  return transactions.map((transaction) => ({
    ...transaction,
    amount: parseFloat(transaction.amount.toFixed(2)),
  }));
}

export async function markTransactionAsRead(transactionId: string) {
  await db.transaction.update({
    where: { id: transactionId },
    data: { unread: false },
  });
}
