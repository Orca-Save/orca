'use client';

import { Transaction } from '@prisma/client';
import { Button, Form, Input, Select, Switch } from 'antd';

type TransactionFormProps = {
  transaction: Transaction;
};
export default function TransactionForm({ transaction }: TransactionFormProps) {
  return (
    <Form layout='vertical' initialValues={transaction}>
      <Form.Item label='Merchant Name' name='merchantName'>
        <Input disabled />
      </Form.Item>
      <Form.Item label='Amount' name='amount'>
        <Input disabled />
      </Form.Item>

      <Form.Item label='Authorized Date' name='date'>
        <Input disabled />
      </Form.Item>

      <Form.Item
        label='Category'
        name='personalFinanceCategory'
        rules={[{ required: true, message: 'Please input category!' }]}
      >
        <Select
          options={[
            {
              label: 'Food',
              value: 'Food',
            },
            {
              label: 'Shopping',
              value: 'Shopping',
            },
            {
              label: 'Transportation',
              value: 'Transportation',
            },
            {
              label: 'Entertainment',
              value: 'Entertainment',
            },
            {
              label: 'Health',
              value: 'Health',
            },
            {
              label: 'Other',
              value: 'Other',
            },
          ]}
        />
      </Form.Item>

      <Form.Item label='Reviewed' name='read'>
        <Switch />
      </Form.Item>
      <Form.Item label='Impulse Buy'>
        <Switch />
      </Form.Item>
      <Button type='primary' htmlType='submit'>
        Save
      </Button>
    </Form>
  );
}
