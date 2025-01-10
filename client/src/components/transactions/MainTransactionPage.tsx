import { Flex, Skeleton, Space } from 'antd';
import React from 'react';

import useFetch from '../../hooks/useFetch';
import ReviewLink from '../plaid/ReviewLink';
import TransactionList from './TransactionList';

export default function TransactionsPage() {
  const { data } = useFetch('api/pages/transactionsPage', 'GET');
  if (!data) return <Skeleton active />;
  const { unreadObj, formattedTransactions, userTour } = data;

  return (
    <Flex
      vertical
      style={{
        overflow: 'hidden',
        height: 'calc(100% - 70px)',
      }}
    >
      <ReviewLink unreadObj={unreadObj} />
      <TransactionList
        transactions={formattedTransactions}
        userTour={userTour}
      />
    </Flex>
  );
}
