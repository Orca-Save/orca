import { Skeleton } from 'antd';
import React from 'react';

import useFetch from '../../hooks/useFetch';
import SavingsPage from './SavingsPage';

export default function OneTapPage() {
  const { data } = useFetch('api/pages/savingsPage', 'GET');
  if (!data) return <Skeleton active />;
  const { goalTransfers, completedCounts, userTour } = data;
  return (
    <SavingsPage
      totalSaved={completedCounts.totalSaved}
      goalsCompleted={completedCounts.goalsCompleted}
      topGoalTransfers={goalTransfers.filter(
        (transfer: any) => transfer.pinned
      )}
      bottomGoalTransfers={goalTransfers.filter(
        (transfer: any) =>
          !transfer.goalId && !transfer.pinned && transfer.amount > 0
      )}
      saveHref='/savings/new'
      newSaveText='Add One-Tap Save'
      filter='templates'
      userTour={userTour}
    />
  );
}
