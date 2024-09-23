import React from 'react';
import { discretionaryFilter } from 'shared-library/dist/plaidCategories';

import { Skeleton } from 'antd';
import useFetch from '../../hooks/useFetch';
import UnreadTransactionsSwiper from './UnreadTransactionsSwiper';

export default function ReviewPage() {
  const { data } = useFetch('api/pages/reviewPage', 'GET');
  if (!data) return <Skeleton active />;
  const { formattedTransactions, pinnedUserGoal } = data;
  return (
    <UnreadTransactionsSwiper
      focusGoalImgURL={pinnedUserGoal?.imagePath ?? ''}
      formattedTransactions={formattedTransactions.filter(discretionaryFilter)}
    />
  );
}
