'use client';

import { plaidCategories } from '@/lib/plaid';
import { FrownOutlined, MehOutlined, SmileOutlined } from '@ant-design/icons';
import { Transaction } from '@prisma/client';
import { Button, Flex, Form, Input, Rate, Select, Space, Switch } from 'antd';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const { TextArea } = Input;
const customIcons: Record<number, React.ReactNode> = {
  1: <FrownOutlined />,
  2: <FrownOutlined />,
  3: <MehOutlined />,
  4: <SmileOutlined />,
  5: <SmileOutlined />,
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
          note: values.note,
        });
        router.back();
      }}
    >
      <Space direction='vertical' className='w-full'>
        <Form.Item
          label='Category'
          name='personalFinanceCategory'
          rules={[{ message: 'Please input category!' }]}
        >
          <Select options={plaidCategories} />
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
        <Form.Item name='note' label='Note'>
          <TextArea />
        </Form.Item>
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
