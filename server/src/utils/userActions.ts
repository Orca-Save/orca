'use server';

import { removeAllPlaidItems } from '@/app/_actions/plaid';
import db from '../db/db';

// function clears all user data
export async function clearUserData(userId: string) {
  await removeAllPlaidItems(userId);

  db.userProfile.delete({
    where: { userId },
  });
  db.transaction.deleteMany({
    where: { userId },
  });
  db.goal.deleteMany({
    where: { userId },
  });
  db.onboardingProfile.delete({
    where: { userId },
  });
  db.goalTransfer.deleteMany({
    where: { userId },
  });

  return true;
}
