import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Card, Col, Popconfirm, Row, Typography } from 'antd';
import { Link } from 'react-router-dom';

import { Goal } from '../../types/all';
import { apiFetch } from '../../utils/general';
import GoalProgress from '../goals/GoalProgress';
import PinSavingButton from '../savings/PinSavingButton';

const { Text } = Typography;

export default function GoalCard({
  goal,
  userHasPinnedGoal,
  revalidatePath,
  hideActions,
}: {
  goal: Goal;
  userHasPinnedGoal: boolean;
  revalidatePath: string;
  hideActions?: boolean;
}) {
  let marginTop = goal.pinned ? '-14px' : '-11px';
  if (hideActions) marginTop = '-35px';
  const duaAt = new Date(goal.dueAt).toLocaleDateString();
  return (
    <div>
      <Card
        key={goal.id}
        size='small'
        style={
          !goal.pinned
            ? undefined
            : { paddingBottom: hideActions ? '28px' : '5px' }
        }
        actions={
          hideActions
            ? undefined
            : [
                <Popconfirm
                  title='Delete the goal'
                  description='Are you sure you want to delete this goal?'
                  onConfirm={async () => {
                    await apiFetch(`/api/goals/deleteGoal`, 'POST', {
                      goalId: goal.id,
                    });
                    window.location.reload();
                  }}
                  okText='Yes'
                  cancelText='No'
                >
                  <DeleteOutlined key='delete' />
                </Popconfirm>,
                <Link to={`/goals/${goal.id}`} key='view'>
                  <EditOutlined />
                </Link>,

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
              ]
        }
      >
        <Row>
          <Col span={12}>
            <Text style={{ fontWeight: 'bold' }}>{goal.name}</Text>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            {'by ' + duaAt}
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
          target={goal.targetAmount}
        />
      </Card>
      {goal.imagePath ? (
        <div
          style={{
            backgroundImage: goal.imagePath ? `url(${goal.imagePath})` : '',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            marginTop,
            border: '1px solid #CFCFCF',
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
