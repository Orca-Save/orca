'use server';

import db from '@/db/db';

export async function getTransactions(userId: string) {
  const transactions = await db.transaction.findMany({
    where: {
      userId,
    },
  });

  return transactions;
}

export async function getGoalTransfers(userId: string) {
  return db.goalTransfer.findMany({
    where: {
      userId,
    },
    include: { category: true },
    orderBy: { transactedAt: 'desc' },
  });
}
