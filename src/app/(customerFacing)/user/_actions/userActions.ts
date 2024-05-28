'use server';

import db from '@/db/db';

// function clears all user data
export async function clearUserData(userId: string) {
  // clear user data
  db.userProfile.updateMany({
    where: { userId },
    data: { deletedAt: new Date(), userId: '' },
  });
  db.transaction.updateMany({
    where: { userId },
    data: { deletedAt: new Date(), userId: '' },
  });
  db.plaidItem.updateMany({
    where: { userId },
    data: { deletedAt: new Date(), userId: '' },
  });
  db.goal.updateMany({
    where: { userId },
    data: { deletedAt: new Date(), userId: '' },
  });
  db.onboardingProfile.updateMany({
    where: { userId },
    data: { deletedAt: new Date(), userId: '' },
  });
  db.goalTransfer.updateMany({
    where: { userId },
    data: { deletedAt: new Date(), userId: '' },
  });

  return true;
}
