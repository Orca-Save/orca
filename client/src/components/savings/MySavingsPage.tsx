import React from 'react';

import useFetch from '../../hooks/useFetch';
import SavingsPage from './SavingsPage';

export default function SavesPage() {
  const { data } = useFetch('api/pages/savingsPage', 'GET');
  console.log(data);
  if (!data) return null;
  const { goalTransfers, completedCounts } = data;
  return (
    <SavingsPage
      totalSaved={completedCounts.totalSaved}
      goalsCompleted={completedCounts.goalsCompleted}
      bottomGoalTransfers={goalTransfers}
      saveHref='/savings/new'
      newSaveText='Impulse Save'
    />
  );
}
