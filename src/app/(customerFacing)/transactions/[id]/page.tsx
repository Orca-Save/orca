import { Text, Title } from '@/app/_components/Typography';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { currencyFormatter } from '@/lib/utils';
import { Flex, Space } from 'antd';
import { format } from 'date-fns';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import db from '../../../../../server/src/db/db';
import TransactionForm from '../../log/transactions/_components/TransactionForm';

export default async function TransactionPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || !isExtendedSession(session)) redirect('/');
  const transaction = await db.transaction.findUnique({
    where: { transactionId: id },
  });

  if (!transaction) {
    return redirect('/');
  }
  if (transaction.userId !== session.user.id) {
    return redirect('/');
  }

  const account = await db.account.findUnique({
    where: { id: transaction.accountId },
  });
  const amount = transaction.amount.toNumber();
  const date = transaction.authorizedDate ?? transaction.date;
  return (
    <>
      <Title level={3}>Edit Transaction</Title>

      <Flex
        justify='center'
        style={{
          marginBottom: '2rem',
        }}
      >
        <Space direction='vertical' className='w-1/2'>
          <Text strong>Merchant Name</Text>
          <Text>
            {transaction.merchantName ?? transaction.merchantName ?? 'Unknown'}
          </Text>
          <Text strong>Amount</Text>
          <Text type={amount < 0 ? 'success' : undefined}>
            {currencyFormatter(amount, undefined, true)}
          </Text>
          <Text strong>Transaction Name</Text>
          <Text>{transaction?.name ? transaction.name : 'Unknown'}</Text>
        </Space>
        <Space direction='vertical' className='w-1/2'>
          <Text strong>Authorized Date</Text>
          <Text>{format(date, 'EEE, MMMM dd')}</Text>
          <Text strong>Recurring</Text>
          <Text>{transaction.recurring ? 'Yes' : 'No'}</Text>
          <Text strong>Account Name</Text>
          <Text>{` (${account?.name} ${account?.mask})`}</Text>
        </Space>
      </Flex>
      <TransactionForm transaction={transaction} />
    </>
  );
}
