import { Skeleton } from 'antd';
import React from 'react';

import useFetch from '../../hooks/useFetch';
import ReviewLink from '../plaid/ReviewLink';
import TransactionList from './TransactionList';

export default function TransactionsPage() {
  const { data } = useFetch('api/pages/transactionsPage', 'GET');
  if (!data) return <Skeleton active />;
  const { unreadObj, formattedTransactions, userTour } = data;

  return (
    <div className='flex flex-col flex-grow overflow-hidden max-h-[calc(100vh-180px)]'>
      <ReviewLink unreadObj={unreadObj} />
      <TransactionList
        transactions={formattedTransactions}
        userTour={userTour}
      />
    </div>
  );
}
