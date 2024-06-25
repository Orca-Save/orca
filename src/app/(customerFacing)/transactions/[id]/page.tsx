import { Text, Title } from '@/app/_components/Typography';
import db from '@/db/db';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { currencyFormatter } from '@/lib/utils';
import { Flex, Space } from 'antd';
import { format } from 'date-fns';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
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
  return (
    <>
      <Title level={3}>Edit Transaction</Title>

      <Flex justify='center'>
        <Space direction='vertical' className='w-full'>
          <Text strong>Transaction Name</Text>
          <Text
            ellipsis={{
              tooltip: true,
            }}
          >
            {transaction?.name ? transaction.name : 'Unknown'}
          </Text>
          <Text strong>Merchant Name</Text>
          <Text>
            {transaction.merchantName ?? transaction.merchantName ?? 'Unknown'}
          </Text>
          <Text strong>Amount</Text>
          <Text type={amount < 0 ? 'success' : undefined}>
            {currencyFormatter(amount, undefined, true)}
          </Text>
        </Space>
        <Space direction='vertical' className='w-full'>
          <Text strong>Account Name</Text>
          <Text
            ellipsis={{
              tooltip: true,
            }}
          >
            {` (${account?.name} ${account?.mask})`}
          </Text>
          <Text strong>Authorized Date</Text>
          <Text>{format(transaction.date, 'EEE, MMMM dd')}</Text>
          <Text strong>Recurring</Text>
          <Text>{transaction.recurring ? 'Yes' : 'No'}</Text>
        </Space>
      </Flex>
      <TransactionForm transaction={transaction} />
    </>
  );
}
