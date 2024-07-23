import PinSavingButton from '@/app/_components/PinSavingButton';
import { Text, Title } from '@/app/_components/Typography';
import { greenThemeColors } from '@/lib/themeConfig';
import { currencyFormatter } from '@/lib/utils';
import { red } from '@ant-design/colors';
import { FrownOutlined, MehOutlined, SmileOutlined } from '@ant-design/icons';
import { GoalTransfer } from '@prisma/client';
import { Avatar, Card, Col, Row, Space } from 'antd';
import Meta from 'antd/es/card/Meta';
import EditAction from './EditAction';
import PopconfirmDelete from './PopconfirmDelete';

export type GoalTransferFilter = 'templates' | 'accounts';

export default async function SavingsList({
  filter,
  routeParams,
  topGoalTransfers,
  bottomGoalTransfers,
}: {
  filter?: GoalTransferFilter;
  routeParams: string;
  topGoalTransfers?: GoalTransfer[];
  bottomGoalTransfers: GoalTransfer[];
}) {
  const isTemplates = filter === 'templates';
  const pinnedTitle = isTemplates ? 'Pinned to Home' : '';
  const otherTitle = isTemplates ? 'One-Tap Saves' : '';

  return (
    <>
      {isTemplates ? (
        <>
          <Space className='center-space'>
            <Title level={4}>{pinnedTitle}</Title>
          </Space>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {topGoalTransfers?.map((goalTransfer) => (
              <GoalTransferCard
                key={goalTransfer.id}
                routeParams={routeParams}
                goalTransfer={goalTransfer}
                showPin={filter === 'templates'}
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
            routeParams={routeParams}
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
  routeParams,
  showPin,
}: {
  goalTransfer: GoalTransfer;
  routeParams: string;
  showPin: boolean;
}) {
  const amount = goalTransfer.amount.toNumber();
  const rating = goalTransfer.rating;
  let ratingIcon = <MehOutlined />;
  let ratingColor = undefined;
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
  return (
    <Card
      key={goalTransfer.id}
      actions={[
        <PopconfirmDelete
          goalTransferId={goalTransfer.id}
          key='delete'
          title='Delete the saving'
          description='Are you sure you want to delete this saving?'
        />,
        <EditAction
          key='edit'
          route={
            `/${goalTransfer.amount.toNumber() > 0 ? 'savings' : 'purchases'}/${
              goalTransfer.id
            }/edit` + routeParams
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
        description={goalTransfer.transactedAt?.toDateString()}
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
