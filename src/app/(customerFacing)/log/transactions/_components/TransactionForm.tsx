'use client';

import { plaidCategories } from '@/lib/plaid';
import { currencyFormatter } from '@/lib/utils';
import { Transaction } from '@prisma/client';
import {
  Button,
  Flex,
  Form,
  Rate,
  Select,
  Space,
  Switch,
  Typography,
} from 'antd';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { saveTransaction } from '../_actions/transactions';

const { Text } = Typography;

const customIcons: Record<number, React.ReactNode> = {
  1: <span>😞</span>,
  2: <span>😐</span>,
  3: <span>😊</span>,
  4: <span>😃</span>,
  5: <span>😍</span>,
};
type TransactionFormProps = {
  transaction: Transaction;
};

export default function TransactionForm({ transaction }: TransactionFormProps) {
  const router = useRouter();
  const [impulse, setImpulse] = useState(transaction.impulse);
  const amount = transaction.amount as unknown as number;
  return (
    <Form
      layout='vertical'
      initialValues={{
        ...transaction,
        personalFinanceCategory:
          (transaction.personalFinanceCategory as any)?.primary || null,
      }}
      onFinish={async (values) => {
        await saveTransaction({
          read: values.read,
          impulse: values.impulse,
          userId: transaction.userId,
          transactionId: transaction.transactionId,
          personalFinanceCategory: {
            ...(transaction.personalFinanceCategory as any),
            primary: values.personalFinanceCategory,
          },
          rating: values.rating,
          impulseReturn: values.impulseReturn,
        });
        router.back();
      }}
    >
      <Space direction='vertical' className='w-full'>
        <Flex justify='center'>
          <Space direction='vertical' className='w-full'>
            <Text strong>Merchant Name</Text>
            <Text>{transaction.merchantName ?? transaction.name ?? ' '}</Text>
            <Text strong>Amount</Text>
            <Text>{currencyFormatter(amount)}</Text>
          </Space>
          <Space direction='vertical' className='w-full'>
            <Text strong>Authorized Date</Text>
            <Text>{format(transaction.date, 'EEE, MMMM dd')}</Text>
            <Text strong>Recurring</Text>
            <Text>{transaction.recurring ? 'Yes' : 'No'}</Text>
          </Space>
        </Flex>
        <Form.Item
          label='Category'
          name='personalFinanceCategory'
          rules={[{ message: 'Please input category!' }]}
        >
          <Select options={plaidCategories()} />
        </Form.Item>
        <Space>
          {amount > 0 && (
            <Form.Item label='Impulse Buy' name='impulse'>
              <Switch onChange={(value) => setImpulse(value)} />
            </Form.Item>
          )}
          {amount < 0 && (
            <Form.Item label='Impulse Buy Return' name='impulseReturn'>
              <Switch />
            </Form.Item>
          )}
        </Space>
        <Form.Item label='Reviewed' name='read'>
          <Switch />
        </Form.Item>
        {impulse && (
          <Form.Item
            required
            label='How did you feel about this purchase?'
            tooltip={
              <>
                <p style={{ marginBottom: '0.5rem' }}>
                  This rating is necessary to ensure the insights we deliver are
                  truly personalized.
                </p>
                <p>
                  For example, we don&apos;t want to suggest you cut back on
                  “Yoga with friends” to meet your goal if this is something you
                  truly value.
                </p>
              </>
            }
            name='rating'
          >
            <Rate
              style={{ marginTop: 8 }}
              character={({ index = 0 }) => customIcons[index + 1]}
            />
          </Form.Item>
        )}
      </Space>
      <Flex justify='end'>
        <Space>
          <Button onClick={() => router.back()}>Cancel</Button>
          <Button type='primary' htmlType='submit'>
            Save
          </Button>
        </Space>
      </Flex>
    </Form>
  );
}
