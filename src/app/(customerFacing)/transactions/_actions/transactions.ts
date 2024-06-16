'use server';

import db from '@/db/db';

export async function saveTransaction({
  userId,
  personalFinanceCategory,
  transactionId,
  impulse,
  read,
  rating,
}: {
  userId: string;
  transactionId: string;
  personalFinanceCategory: Object;
  rating: number;
  impulse: boolean;
  read: boolean;
}) {
  await db.transaction.update({
    where: { userId, transactionId },
    data: {
      personalFinanceCategory: personalFinanceCategory as any,
      impulse,
      read,
      rating,
    },
  });
}
