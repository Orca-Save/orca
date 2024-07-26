import { GoalForm } from '@/app/_components/GoalForm';
import { Title } from '@/app/_components/Typography';
import { plaidCategories } from '@/lib/plaid';
import { headers } from 'next/headers';
import db from '../../../../../server/src/db/db';

const getCategories = () => {
  return db.goalCategory.findMany({
    orderBy: { name: 'asc' },
  });
};

export default async function EditGoalPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const headersList = headers();
  const referer = headersList.get('referer');
  const [goal] = await Promise.all([db.goal.findUnique({ where: { id } })]);

  let initialAmount: number | undefined = undefined;
  if (goal?.initialTransferId)
    initialAmount = (
      await db.goalTransfer.findFirst({
        where: { id: goal.initialTransferId },
      })
    )?.amount.toNumber();

  return (
    <>
      <Title>Edit Goal</Title>
      <GoalForm
        goal={goal}
        referer={referer!}
        categories={plaidCategories}
        initialAmount={initialAmount}
      />
    </>
  );
}
