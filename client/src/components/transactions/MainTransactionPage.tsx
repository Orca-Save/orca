import React from 'react';

import useFetch from '../../hooks/useFetch';
import ReviewLink from '../plaid/ReviewLink';
import TransactionList from './TransactionList';

export default function TransactionsPage() {
  const { data } = useFetch('api/pages/transactionsPage', 'GET');
  if (!data) return null;
  const { unreadObj, formattedTransactions, userTour } = data;

  return (
    <>
      <ReviewLink unreadObj={unreadObj} />
      <TransactionList
        transactions={formattedTransactions}
        userTour={userTour}
      />
    </>
  );
}
