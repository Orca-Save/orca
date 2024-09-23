import React from 'react';

import { Skeleton } from 'antd';
import useFetch from '../../hooks/useFetch';
import SavingsPage from './SavingsPage';

export default function SavesPage() {
  const { data } = useFetch('api/pages/savingsPage', 'GET');
  if (!data) return <Skeleton active />;
  const { goalTransfers, completedCounts } = data;
  return (
    <SavingsPage
      totalSaved={completedCounts.totalSaved}
      goalsCompleted={completedCounts.goalsCompleted}
      bottomGoalTransfers={goalTransfers.filter(
        (transfer: any) => transfer.goalId !== null || transfer.amount < 0
      )}
      saveHref='/savings/new'
      newSaveText='Impulse Save'
    />
  );
}
