import { Button, Col, Flex, Row, Skeleton, Space } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import CompletedCounts from '../shared/CompletedCounts';
import GoalList from './GoalList';

export default function GoalsPage() {
  const { data } = useFetch('api/components/goalCard', 'GET');
  const { data: goalsResults } = useFetch('api/goals', 'GET');
  if (!data) return <Skeleton active />;
  if (!goalsResults) return null;
  const { goals } = goalsResults;
  const { completedCounts, userTour } = data;
  return (
    <Flex vertical style={{ height: '100%' }}>
      <Space direction='vertical' className='w-full overflow-auto'>
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
        <GoalList goals={goals} userTour={userTour?.pinnedGoal === false} />
      </Space>
    </Flex>
  );
}
