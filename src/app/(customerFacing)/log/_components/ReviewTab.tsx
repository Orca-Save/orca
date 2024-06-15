import { getFormattedTransactions } from '@/app/_actions/plaid';
import { HappyProvider } from '@/components/HappyProvider';
import { Button } from 'antd';
import Link from 'next/link';
import TransactionList from './TransactionList';

type ReviewTabProps = {
  userId: string;
};
export default async function ReviewTab({ userId }: ReviewTabProps) {
  const formattedTransactions = await getFormattedTransactions(userId);
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
