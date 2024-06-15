'use client';

import { plaidCategories } from '@/lib/plaid';
import { currencyFormatter } from '@/lib/utils';
import { Transaction } from '@prisma/client';
import { Button, Flex, Form, Select, Space, Switch, Typography } from 'antd';
import { format } from 'date-fns';

const { Text } = Typography;

type TransactionFormProps = {
  transaction: Transaction;
};

export default function TransactionForm({ transaction }: TransactionFormProps) {
  return (
    <Form
      layout='vertical'
      initialValues={{
        ...transaction,
        personalFinanceCategory:
          (transaction.personalFinanceCategory as any)?.primary || null,
      }}
    >
      <Space direction='vertical' className='w-full'>
        <Flex justify='center'>
          <Space direction='vertical' className='w-full'>
            <Text strong>Merchant Name</Text>
            <Text>{transaction.merchantName}</Text>
            <Text strong>Amount</Text>
            <Text>{currencyFormatter(transaction.amount as any)}</Text>
          </Space>
          <Space direction='vertical' className='w-full'>
            <Text strong>Authorized Date</Text>
            <Text>{format(transaction.date, 'EEE, MMMM dd')}</Text>
            <Text strong>Recurring</Text>
            <Switch disabled value={transaction.recurring} />
          </Space>
        </Flex>
        <Form.Item
          label='Category'
          name='personalFinanceCategory'
          rules={[{ required: true, message: 'Please input category!' }]}
        >
          <Select options={plaidCategories()} />
        </Form.Item>
        <Form.Item label='Reviewed' name='read'>
          <Switch />
        </Form.Item>
        <Form.Item label='Impulse Buy'>
          <Switch />
        </Form.Item>
      </Space>
      <Flex justify='end'>
        <Button type='primary' htmlType='submit'>
          Save
        </Button>
      </Flex>
    </Form>
  );
}
