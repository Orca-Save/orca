import {
  getFormattedTransactions,
  getTransactions,
} from '@/app/_actions/plaid';
import { completedUserGoalCount } from '@/app/_actions/users';
import { Title } from '@/app/_components/Typography';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { Flex, Space } from 'antd';
import dayjs from 'dayjs';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import CompletedCounts from '../_components/CompletedCounts';
import UnreadButton from './_components/UnreadButton';
import UnreadTransactionsSwiper from './_components/UnreadTransactionsSwiper';

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !isExtendedSession(session)) redirect('/');

  const [formattedTransactions, completedCounts, transactions] =
    await Promise.all([
      getFormattedTransactions(session.user.id, false, false),
      completedUserGoalCount(session.user.id),
      getTransactions(
        session.user.id,
        dayjs().subtract(90, 'day').format('YYYY-MM-DD'),
        dayjs().format('YYYY-MM-DD')
      ),
    ]);

  return (
    <div className='min-h-full max-h-full flex flex-col'>
      <Space direction='vertical' size='large' align='center'>
        <Flex justify='center'>
          <Title level={3}>Review Transactions</Title>
        </Flex>
        <CompletedCounts
          goalsCompleted={completedCounts.goalsCompleted}
          totalSaved={completedCounts.totalSaved}
        />
        <Space>
          <UnreadButton userId={session.user.id} />
        </Space>
      </Space>
      <div className='mt-auto w-full'>
        <UnreadTransactionsSwiper
          userId={session.user.id}
          formattedTransactions={formattedTransactions}
        />
      </div>
    </div>
  );
}
