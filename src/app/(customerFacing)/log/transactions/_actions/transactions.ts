'use server';

import db from '@/db/db';
import { revalidatePath } from 'next/cache';

export async function saveTransaction({
  userId,
  personalFinanceCategory,
  transactionId,
  impulse,
  read,
  rating,
  impulseReturn,
}: {
  read: boolean;
  userId: string;
  impulse: boolean;
  transactionId: string;
  personalFinanceCategory: Object;
  rating?: number;
  impulseReturn?: boolean;
}) {
  await db.transaction.update({
    where: { userId, transactionId },
    data: {
      personalFinanceCategory: personalFinanceCategory as any,
      impulse,
      impulseReturn,
      read,
      rating,
    },
  });
  revalidatePath('/log/log/transactions');
  revalidatePath('/log/transactions');
}
