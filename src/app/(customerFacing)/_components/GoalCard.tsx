import PinSavingButton from '@/app/_components/PinSavingButton';
import { Goal as PrismaGoal } from '@prisma/client';
import { Card, Col, Row, Space } from 'antd';
import Meta from 'antd/es/card/Meta';
import GoalProgress from '../goals/_components/GoalProgress';
import PopconfirmDelete from '../goals/_components/PopconfirmDelete';
import EditAction from './EditAction';
import { Text } from '@/app/_components/Typography';
import { ConfigProvider } from '@/components/ConfigProvider';
import { cardThemeConfig } from '@/lib/themes';

type Goal = PrismaGoal & {
  savedItemCount: number;
  currentBalance: number;
};

export default function GoalCard({
  goal,
  userHasPinnedGoal,
  revalidatePath,
}: {
  goal: Goal;
  userHasPinnedGoal: boolean;
  revalidatePath: string;
}) {
  return (
    <div>
      <Card
        key={goal.id}
        size='small'
        actions={[
          <PopconfirmDelete
            goalId={goal.id}
            key='delete'
            title='Delete the goal'
            description='Are you sure you want to delete this goal?'
          />,
          <EditAction route={`/goals/${goal.id}/edit`} key='edit' />,
          ...(revalidatePath !== '/'
            ? [
                <PinSavingButton
                  key='pin'
                  type='Goal'
                  typeId={goal.id}
                  pinned={goal.pinned}
                  userHasPinnedGoal={userHasPinnedGoal}
                />,
              ]
            : []),
          // <ShareAltOutlined key="share" />,
        ]}>
        <Row>
          <Col span={12}>
            <Text style={{ fontWeight: 'bold' }}>{goal.name}</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            {'by ' + goal.dueAt.toLocaleDateString()}
          </Col>
        </Row>
        <Row justify='space-between'>
          <Col span={12}></Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <p>{goal.savedItemCount} Saves!</p>
          </Col>
        </Row>
        <GoalProgress
          currentBalance={goal.currentBalance ?? 0}
          target={goal.targetAmount.toNumber()}
        />
      </Card>
      {goal.imagePath ? (
        <div
          style={{
            backgroundImage: goal.imagePath ? `url(${goal.imagePath})` : '',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            marginTop: '-11px',
            borderRadius: '7px',
            zIndex: 1,
            position: 'relative',
            height: '150px',
          }}
        />
      ) : null}
    </div>
  );
}
