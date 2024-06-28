import { Title } from '@/app/_components/Typography';
import db from '@/db/db';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { Transaction } from '@prisma/client';
import { format, startOfWeek } from 'date-fns';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import TransactionChart from './_component/TransactionChart';

export default async function ChartPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/');
  if (!isExtendedSession(session)) redirect('/');

  const transactions = await db.transaction.findMany({
    where: {
      userId: session.user.id,
    },
  });

  // manipulate the data by grouping them by whether impulse is true or not, and by week then pass the data to the Transaction chart
  const groupedData = transactions.reduce((acc: any, transaction) => {
    const date = transaction.authorizedDate ?? transaction.date;
    const week = format(startOfWeek(new Date(date)), 'yyyy-MM-dd');
    const impulseKey = transaction.impulse ? 'impulse' : 'non-impulse';

    if (!acc[week]) {
      acc[week] = { impulse: [], 'non-impulse': [] };
    }
    acc[week][impulseKey].push(transaction);

    return acc;
  }, {});

  // Format data for TransactionChart component
  const chartData = Object.keys(groupedData).flatMap((week) =>
    [
      {
        week,
        impulse: 'impulse',
        value: groupedData[week].impulse.length,
      },
      {
        week,
        impulse: 'non-impulse',
        value: groupedData[week]['non-impulse'].length,
      },
    ].filter((data) => data.value > 0)
  );
  // duplicate chartData but value is the sum of the amount for impulse and non-impulse
  const chartDataWithSum = Object.keys(groupedData).flatMap((week) =>
    [
      {
        week,
        impulse: 'impulse',
        value: groupedData[week].impulse.reduce(
          (sum: number, transaction: Transaction) =>
            sum + transaction.amount.toNumber(),
          0
        ),
      },
      {
        week,
        impulse: 'non-impulse',
        value: groupedData[week]['non-impulse'].reduce(
          (sum: number, transaction: Transaction) =>
            sum + transaction.amount.toNumber(),
          0
        ),
      },
    ].filter((data) => data.value > 0)
  );
  return (
    <>
      <Title level={4}>Impulse Counts</Title>
      <TransactionChart data={chartData} />
      <Title level={4}>Impulse sum</Title>
      <TransactionChart data={chartDataWithSum} />
    </>
  );
}
