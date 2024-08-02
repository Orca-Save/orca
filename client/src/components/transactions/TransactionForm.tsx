import { FrownOutlined, MehOutlined, SmileOutlined } from '@ant-design/icons';
import {
  Button,
  Flex,
  Form,
  Input,
  Rate,
  Select,
  Space,
  Switch,
  Typography,
} from 'antd';
import { format } from 'date-fns';
import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { plaidCategories } from 'shared-library/dist/plaidCategories';

import { Account, Transaction } from '../../types/all';
import { apiFetch, currencyFormatter } from '../../utils/general';

const { Title, Text } = Typography;
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
  account: Account;
};

export default function TransactionForm({
  transaction,
  account,
}: TransactionFormProps) {
  const navigate = useNavigate();
  const [impulse, setImpulse] = useState(transaction.impulse);
  const amount = transaction.amount;

  const date = new Date(transaction.authorizedDate ?? transaction.date);
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
      <Form
        layout='vertical'
        initialValues={{
          ...transaction,
          personalFinanceCategory:
            (transaction.personalFinanceCategory as any)?.primary || null,
        }}
        onFinish={async (values) => {
          await apiFetch('/api/transactions', 'POST', {
            transaction: {
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
            },
          });
          navigate(-1);
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
                    This rating is necessary to ensure the insights we deliver
                    are truly personalized.
                  </p>
                  <p>
                    For example, we don&apos;t want to suggest you cut back on
                    “Yoga with friends” to meet your goal if this is something
                    you truly value.
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
            <Button onClick={() => navigate(-1)}>Cancel</Button>
            <Button type='primary' htmlType='submit'>
              Save
            </Button>
          </Space>
        </Flex>
      </Form>
    </>
  );
}
