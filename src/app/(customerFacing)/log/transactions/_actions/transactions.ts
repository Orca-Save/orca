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
