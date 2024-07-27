import { Button, Col, Row, Space } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import CompletedCounts from '../shared/CompletedCounts';
import GoalList from './GoalList';

export default function GoalsPage() {
  const { data } = useFetch('api/components/goalCard', 'GET');
  const { data: goalsResults } = useFetch('api/goals', 'GET');
  if (!data) return null;
  if (!goalsResults) return null;
  const { goals } = goalsResults;
  const { completedCounts } = data;
  return (
    <Space direction='vertical' className='w-full'>
      <Row justify='center'>
        <Col>
          <Link to='/goals/new'>
            <Button data-id='new-goal-button' size='large' type='primary'>
              New Goal
            </Button>
          </Link>
        </Col>
      </Row>
      <div>
        <CompletedCounts
          goalsCompleted={completedCounts.goalsCompleted}
          totalSaved={completedCounts.totalSaved}
        />
      </div>
      <GoalList goals={goals} />
    </Space>
  );
}
