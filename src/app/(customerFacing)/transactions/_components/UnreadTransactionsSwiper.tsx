'use client';
import { Button, Empty, Space, Typography } from 'antd';
import 'antd/dist/reset.css'; // Import Ant Design styles by using 'reset.css'
import { useEffect, useState } from 'react';
import { CardData, CardSwiper } from 'react-card-swiper';
import { markTransactionAsRead, syncTransactions } from '../_actions/plaid';

const { Text } = Typography;

interface Transaction {
  id: string;
  name: string;
  amount: number;
  personalFinanceCategoryIcon: string | null;
  logoIcon: string | null;
  date: Date;
}
interface UnreadTransactionsSwiperProps {
  initialTransactions: Transaction[];
  userId: string;
}

export default function UnreadTransactionsSwiper({
  initialTransactions,
  userId,
}: UnreadTransactionsSwiperProps) {
  const [transactions, setTransactions] = useState(initialTransactions);

  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  const handleDismiss = async (cardData: HTMLDivElement, event: any) => {
    const transactionId = cardData.id;
    await markTransactionAsRead(transactionId);
    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== transactionId)
    );
  };
  console.log('transactions', transactions);

  const transactionCards: CardData[] = transactions.map((transaction) => ({
    id: transaction.id,
    src: transaction.logoIcon ?? '',
    meta: {},
    content: (
      <div style={{ padding: '16px' }}>
        <Text strong>{transaction.name}</Text>
        <br />
        <Text type='secondary'>${transaction.amount.toFixed(2)}</Text>
        <br />
        <Text type='secondary'>
          {new Date(transaction.date).toLocaleDateString()}
        </Text>
      </div>
    ),
  }));

  return (
    <>
      <Button onClick={() => syncTransactions(userId)}>
        Sync Transactions
      </Button>
      <div style={{ height: '100%' }}>
        <CardSwiper
          data={transactionCards}
          onDismiss={handleDismiss}
          dislikeButton={<div>Left</div>}
          likeButton={<div>Right</div>}
          withActionButtons
          withRibbons
          likeRibbonText='READ'
          dislikeRibbonText='READ'
          ribbonColors={{
            bgLike: 'green',
            bgDislike: 'red',
            textColor: 'white',
          }}
          emptyState={
            <Space
              direction='vertical'
              align='center'
              style={{ width: '100%' }}
            >
              <Empty description="You've reached the end of the list" />
            </Space>
          }
        />
      </div>
    </>
  );
}
