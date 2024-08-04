import { Typography } from 'antd';
import React from 'react';

import { GoalForm } from './GoalForm';

const { Title } = Typography;

export default function NewGoalPage() {
  return (
    <>
      <Title>Add Goal</Title>
      <GoalForm />
    </>
  );
}
