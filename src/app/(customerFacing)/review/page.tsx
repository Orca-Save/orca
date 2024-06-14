import {
  getTransactions,
  getUnreadTransactionsAndAccounts,
} from '@/app/_actions/plaid';
import { completedUserGoalCount } from '@/app/_actions/users';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { Button, Space } from 'antd';
import dayjs from 'dayjs';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import CompletedCounts from '../_components/CompletedCounts';
import UnreadButton from './_components/UnreadButton';
import UnreadTransactionsSwiper from './_components/UnreadTransactionsSwiper';

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !isExtendedSession(session)) redirect('/');

  const [plaidItem, completedCounts, transactions] = await Promise.all([
    getUnreadTransactionsAndAccounts(session.user.id),
    completedUserGoalCount(session.user.id),
    getTransactions(
      session.user.id,
      dayjs().subtract(90, 'day').format('YYYY-MM-DD'),
      dayjs().format('YYYY-MM-DD')
    ),
  ]);

  return (
    <div className='min-h-full max-h-full flex flex-col'>
      <Space
        className='flex justify-center'
        direction='vertical'
        size='large'
        align='center'
      >
        <div className='w-full md:w-4/5 lg:w-3/5'>
          <CompletedCounts
            goalsCompleted={completedCounts.goalsCompleted}
            totalSaved={completedCounts.totalSaved}
          />
        </div>
        <Space>
          <UnreadButton userId={session.user.id} />
          <Link href='/'>
            <Button data-id='return-home-button' type='primary' size='large'>
              Return home
            </Button>
          </Link>
        </Space>
      </Space>
      <div className='mt-auto w-full'>
        <UnreadTransactionsSwiper
          userId={session.user.id}
          plaidItem={plaidItem}
        />
      </div>
    </div>
  );
}
