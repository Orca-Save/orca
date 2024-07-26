import { GoalTransferForm } from '../saves/GoalTransferForm';

const getCategories = () => {
  return db.goalCategory.findMany({
    orderBy: { name: 'asc' },
  });
};
const getGoals = (userId: string) => {
  return db.goal.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });
};
const getGoalTransfer = (goalTransferId?: string) => {
  if (!goalTransferId) return null;
  return db.goalTransfer.findUnique({
    where: { id: goalTransferId },
  });
};
export default async function GoalTransferPage({
  title,
  isSavings,
  goalTransferId,
}: {
  title: string;
  isSavings: boolean;
  goalTransferId?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    signIn('azure-ad-b2c', { callbackUrl: baseURL + '/savings' });
    return;
  }

  const [categories, goals, goalTransfer] = await Promise.all([
    getCategories(),
    getGoals(session.user.id),
    getGoalTransfer(goalTransferId),
  ]);

  return (
    <>
      <Title>{title}</Title>
      <GoalTransferForm
        isSavings={isSavings}
        referer={referer!}
        categories={categories}
        goalTransfer={goalTransfer}
        goals={goals}
      />
    </>
  );
}
