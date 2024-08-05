import { Typography } from 'antd';
import { discretionaryFilter } from 'shared-library/dist/plaidCategories';

import useFetch from '../../hooks/useFetch';
import UnreadTransactionsSwiper from './UnreadTransactionsSwiper';

const { Title } = Typography;

export default function ReviewPage() {
  const { data } = useFetch('api/pages/reviewPage', 'GET');
  if (!data) return null;
  const { formattedTransactions, pinnedUserGoal } = data;
  return (
    <UnreadTransactionsSwiper
      focusGoalImgURL={pinnedUserGoal?.imagePath ?? ''}
      formattedTransactions={formattedTransactions.filter(discretionaryFilter)}
    />
  );
}
