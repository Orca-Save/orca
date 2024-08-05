import { Typography } from 'antd';
import React from 'react';
import { useParams } from 'react-router-dom';

import useFetch from '../../hooks/useFetch';
import { GoalForm } from './GoalForm';

const { Title } = Typography;
export default function EditGoalPage() {
  const { id } = useParams();

  const { data } = useFetch('api/pages/editGoalPage', 'POST', {
    goalId: id,
  });
  if (!data) return null;
  const { goal, initialAmount } = data;

  return (
    <>
      <Title>Edit Goal</Title>
      <GoalForm goal={goal} initialAmount={initialAmount} />
    </>
  );
}
