import { completedUserGoalCount } from '@/app/_actions/users';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import dayjs from 'dayjs';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import CompletedCounts from '../(customerFacing)/_components/CompletedCounts';
import {
  getTransactions,
  getUnreadTransactionsAndAccounts,
} from '../(customerFacing)/transactions/_actions/plaid';
import UnreadTransactionsSwiper from '../(customerFacing)/transactions/_components/UnreadTransactionsSwiper';

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

  console.log('transactionsx', transactions.length);

  return (
    <div style={{ height: '100%' }}>
      {/* <Space direction='vertical' className='w-full h-full'> */}
      <div style={{ height: '33%' }} className='flex justify-center'>
        <div className='w-full md:w-4/5 lg:w-3/5'>
          <CompletedCounts
            goalsCompleted={completedCounts.goalsCompleted}
            totalSaved={completedCounts.totalSaved}
          />
        </div>
      </div>
      <div style={{}}>
        <UnreadTransactionsSwiper
          userId={session.user.id}
          plaidItem={plaidItem}
        />
      </div>
      {/* </Space> */}
    </div>
  );
}
