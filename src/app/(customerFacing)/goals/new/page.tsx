import { GoalForm } from '@/app/_components/GoalForm';
import { Title } from '@/app/_components/Typography';
import db from '@/db/db';
import { plaidCategories } from '@/lib/plaid';
import { headers } from 'next/headers';

const getCategories = () => {
  return db.goalCategory.findMany({
    orderBy: { name: 'asc' },
  });
};

export default async function NewGoalPage() {
  const headersList = headers();
  const referer = headersList.get('referer');
  return (
    <>
      <Title>Add Goal</Title>
      <GoalForm referer={referer!} categories={plaidCategories} />
    </>
  );
}
