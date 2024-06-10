import { Button, Card, Col, Row, Skeleton, Space } from 'antd';

import { completedUserGoalCount } from '@/app/_actions/users';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { getServerSession } from 'next-auth';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import CompletedCounts from '../_components/CompletedCounts';

const DynamicGoalList = dynamic(() => import('./_components/GoalList'), {
  loading: () => (
    <>
      <Card>
        <Skeleton paragraph={{ rows: 3 }} />
      </Card>
      <Card>
        <Skeleton paragraph={{ rows: 3 }} />
      </Card>
      <Card>
        <Skeleton paragraph={{ rows: 3 }} />
      </Card>
    </>
  ),
});
export default async function GoalsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/');
  }
  if (!isExtendedSession(session)) return null;
  const completedCounts = await completedUserGoalCount(session.user.id);
  return (
    <Space direction='vertical' className='w-full'>
      <Row justify='center'>
        <Col>
          <Link href='/goals/new'>
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
      <DynamicGoalList />
    </Space>
  );
}
