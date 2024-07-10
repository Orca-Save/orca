import { revalidatePath } from 'next/cache';
import db from './db/db';

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

('use server');

export async function saveTransaction({
  userId,
  personalFinanceCategory,
  transactionId,
  impulse,
  read,
  rating,
  impulseReturn,
  note,
}: {
  read: boolean;
  userId: string;
  impulse: boolean;
  transactionId: string;
  personalFinanceCategory: Object;
  rating?: number;
  impulseReturn?: boolean;
  note?: string;
}) {
  await db.transaction.update({
    where: { userId, transactionId },
    data: {
      personalFinanceCategory: personalFinanceCategory as any,
      impulse,
      impulseReturn,
      read,
      rating,
      note,
    },
  });
  revalidatePath('/');
  revalidatePath('/log/transactions');
}
