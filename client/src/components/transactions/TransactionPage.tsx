import React from 'react';
import { useParams } from 'react-router-dom';

import useFetch from '../../hooks/useFetch';
import TransactionForm from './TransactionForm';

export default function TransactionPage() {
  const { id } = useParams();
  const { data } = useFetch('api/pages/transactionPage', 'POST', {
    transactionId: id,
  });
  if (!data) return null;
  const { transaction, account } = data;

  return <TransactionForm transaction={transaction} account={account} />;
}
