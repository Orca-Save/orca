'use client';

import { List, Space, Typography } from 'antd';
import Link from 'next/link';
const { Text } = Typography;

export default function TransactionList() {
  return (
    <List
      dataSource={[
        {
          date: 'today',
          transactions: [
            {
              id: 1,
              merchantName: 'Amazon',
              amount: 100,
              category: 'Shopping',
              accountName: 'Chase',
              accountMask: '1234',
            },
            {
              id: 1,
              merchantName: 'Walmart',
              amount: 200,
              category: 'Shopping',
              accountName: 'Chase',
              accountMask: '1234',
            },

            {
              id: 1,
              merchantName: 'Target',
              amount: 300,
              category: 'Shopping',
              accountName: 'Chase',
              accountMask: '1234',
            },

            {
              id: 1,
              merchantName: 'Best Buy',
              amount: 400,
              category: 'Shopping',
              accountName: 'Chase',
              accountMask: '1234',
            },
          ],
        },
        {
          date: 'yesterday',
          transactions: [
            {
              id: 1,
              merchantName: 'Amazon',
              amount: 100,
              category: 'Shopping',
              accountName: 'Chase',
              accountMask: '1234',
            },
            {
              id: 1,
              merchantName: 'Walmart',
              amount: 200,
              category: 'Shopping',
              accountName: 'Chase',
              accountMask: '1234',
            },

            {
              id: 1,
              merchantName: 'Target',
              amount: 300,
              category: 'Shopping',
              accountName: 'Chase',
              accountMask: '1234',
            },

            {
              id: 1,
              merchantName: 'Best Buy',
              amount: 400,
              category: 'Shopping',
              accountName: 'Chase',
              accountMask: '1234',
            },
          ],
        },
      ]}
      renderItem={({ date, transactions }) => (
        <List.Item>
          <Space direction='vertical'>
            <Text strong>{date}</Text>
            <List
              dataSource={transactions}
              renderItem={({
                id,
                merchantName,
                amount,
                category,
                accountName,
                accountMask,
              }) => (
                <List.Item>
                  <Space>
                    <Link href={`/transactions/${id}`}>
                      <Text strong>{merchantName}</Text>
                    </Link>
                    <Text>{amount}</Text>
                    <Text>{category}</Text>
                    <Text>{accountName}</Text>
                    <Text>{accountMask}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Space>
        </List.Item>
      )}
    />
  );
}
