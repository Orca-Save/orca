import db from './db';
import { removeAllPlaidItems } from './plaid';

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
