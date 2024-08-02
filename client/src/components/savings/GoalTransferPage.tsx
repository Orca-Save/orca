import React from 'react';
import { useParams } from 'react-router-dom';

import useFetch from '../../hooks/useFetch';
import { GoalTransferForm } from '../saves/GoalTransferForm';

export default function GoalTransferPage() {
  const { id } = useParams();
  const { data } = useFetch('api/pages/goalTransferPage', 'POST', {
    goalTransactionId: id,
  });
  if (!data) return null;
  console.log(data);
  const { goals, goalTransfer } = data;

  return (
    <GoalTransferForm
      goals={goals}
      goalTransfer={goalTransfer}
      isSavings={true}
    />
  );
}
