import { getFormattedTransactions } from '@/app/_actions/plaid';
import {
  completedUserGoalCount,
  getPinnedUserGoal,
} from '@/app/_actions/users';
import { Title } from '@/app/_components/Typography';
import authOptions from '@/lib/nextAuthOptions';
import { discretionaryFilter } from '@/lib/plaid';
import { isExtendedSession } from '@/lib/session';
import { Flex, Space } from 'antd';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import CompletedCounts from '../shared/CompletedCounts';
import UnreadTransactionsSwiper from './UnreadTransactionsSwiper';

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !isExtendedSession(session)) redirect('/');

  const [formattedTransactions, completedCounts, pinnedUserGoal] =
    await Promise.all([
      getFormattedTransactions(session.user.id, false),
      completedUserGoalCount(session.user.id),
      getPinnedUserGoal(session.user.id),
    ]);

  return (
    <>
      <Space direction='vertical' align='center' className='w-full'>
        <Flex justify='center'>
          <Title level={3}>Review Transactions</Title>
        </Flex>
        <CompletedCounts
          goalsCompleted={completedCounts.goalsCompleted}
          totalSaved={completedCounts.totalSaved}
        />
      </Space>
      <UnreadTransactionsSwiper
        userId={session.user.id}
        focusGoalImgURL={pinnedUserGoal?.imagePath ?? ''}
        formattedTransactions={formattedTransactions.filter(
          discretionaryFilter
        )}
      />
    </>
  );
}