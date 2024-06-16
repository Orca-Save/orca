import { getFormattedTransactions } from '@/app/_actions/plaid';
import { HappyProvider } from '@/components/HappyProvider';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { Button } from 'antd';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import TransactionList from '../_components/TransactionList';

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !isExtendedSession(session)) redirect('/');
  const formattedTransactions = await getFormattedTransactions(session.user.id);

  return (
    <>
      <Link href='/review'>
        <HappyProvider>
          <Button
            data-id='review-transactions-nav'
            size='large'
            type='primary'
            style={{
              width: '100%',
              marginBottom: 15,
              height: '90px',
              fontWeight: 'bold',
            }}
          >
            Review Transactions
          </Button>
        </HappyProvider>
      </Link>

      <TransactionList transactions={formattedTransactions} />
    </>
  );
}
