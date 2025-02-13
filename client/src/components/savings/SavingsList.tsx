import { red } from '@ant-design/colors';
import {
  DeleteOutlined,
  EditOutlined,
  FrownOutlined,
  MehOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { Avatar, Card, Col, Popconfirm, Row, Space, Typography } from 'antd';
import Meta from 'antd/es/card/Meta';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { GoalTransfer, UserTour } from '../../types/all';
import { apiFetch, currencyFormatter } from '../../utils/general';
import { greenThemeColors } from '../../utils/themeConfig';
import PinSavingButton from './PinSavingButton';

const { Text, Title } = Typography;

export type GoalTransferFilter = 'templates' | 'accounts';

export default function SavingsList({
  filter,
  topGoalTransfers,
  bottomGoalTransfers,
  userTour,
}: {
  filter?: GoalTransferFilter;
  topGoalTransfers?: GoalTransfer[];
  bottomGoalTransfers: GoalTransfer[];
  userTour: UserTour;
}) {
  const isTemplates = filter === 'templates';
  const pinnedTitle = isTemplates ? 'Pinned to Home' : '';
  const otherTitle = isTemplates ? 'One-Tap Saves' : '';
  let showTour = false;
  if (isTemplates && userTour?.pinnedOneTap === false) {
    showTour = true;
  }
  return (
    <>
      {isTemplates ? (
        <>
          <Space className='center-space'>
            <Title level={4}>{pinnedTitle}</Title>
          </Space>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {topGoalTransfers?.map((goalTransfer, idx) => (
              <GoalTransferCard
                key={goalTransfer.id}
                goalTransfer={goalTransfer}
                showPin={filter === 'templates'}
                userTour={idx === 0 && showTour}
              />
            ))}
          </div>
        </>
      ) : null}
      <Space className='center-space'>
        <Title level={4}>{otherTitle}</Title>
      </Space>
      <div
        className={`grid grid-cols-1 md:grid-cols-${
          !filter ? 1 : 2
        } lg:grid-cols-${!filter ? 1 : 3} gap-4`}
      >
        {bottomGoalTransfers.map((goalTransfer) => (
          <GoalTransferCard
            key={goalTransfer.id}
            goalTransfer={goalTransfer}
            showPin={filter === 'templates'}
          />
        ))}
      </div>
    </>
  );
}

function GoalTransferCard({
  goalTransfer,
  showPin,
  userTour,
}: {
  goalTransfer: GoalTransfer;
  showPin: boolean;
  userTour?: boolean;
}) {
  const navigate = useNavigate();
  const amount = goalTransfer.amount;
  const rating = goalTransfer.rating;
  let ratingIcon = <MehOutlined />;
  let ratingColor: string | undefined = undefined;
  if (rating !== null) {
    if (rating < 3) {
      ratingIcon = <FrownOutlined />;
      ratingColor = red[4];
    }
    if (rating > 3) {
      ratingIcon = <SmileOutlined />;
      ratingColor = greenThemeColors.colorPrimary;
    }
  }
  const transactedAt = new Date(goalTransfer.transactedAt).toDateString();
  return (
    <Card
      key={goalTransfer.id}
      actions={[
        <Popconfirm
          title='Delete the saving'
          description='Are you sure you want to delete this saving?'
          onConfirm={async () => {
            await apiFetch('/api/goals/deleteGoalTransfer', 'POST', {
              id: goalTransfer.id,
            });
            window.location.reload();
          }}
          okText='Yes'
          cancelText='No'
        >
          <DeleteOutlined key='delete' />
        </Popconfirm>,
        <EditOutlined
          onClick={() =>
            navigate(
              `/${goalTransfer.amount > 0 ? 'savings' : 'purchases'}/${
                goalTransfer.id
              }`
            )
          }
        />,
        ...(showPin
          ? [
              <PinSavingButton
                key='pin'
                type='GoalTransfer'
                typeId={goalTransfer.id}
                userHasPinnedGoal={false}
                pinned={goalTransfer.pinned}
                userTour={userTour}
              />,
            ]
          : []),
      ]}
    >
      <Meta
        avatar={
          <Avatar src='https://api.dicebear.com/7.x/miniavs/svg?seed=8' />
        }
        title={goalTransfer.itemName}
        description={transactedAt}
      />
      <Row>
        <Col span={12}>
          <Text type={amount < 0 ? 'danger' : undefined}>
            {currencyFormatter(amount)}
          </Text>
        </Col>
        <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {amount < 0 ? (
            <div style={{ color: ratingColor }}>{ratingIcon}</div>
          ) : null}
        </Col>
      </Row>
    </Card>
  );
}
