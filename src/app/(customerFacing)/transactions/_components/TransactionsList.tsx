'use client';
import { Avatar, List } from 'antd';

export default async function TransactionsList({
  transactions,
}: {
  transactions: any[];
}) {
  return (
    <List>
      {transactions.map((transaction) => (
        <List.Item key={transaction.transaction_id}>
          <List.Item.Meta
            avatar={<Avatar src={transaction.logo_url} />}
            title={transaction.name}
            description={transaction.amount}
          />
        </List.Item>
      ))}
    </List>
  );
}
