import { Button, ConfigProvider, Space } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { GoalTransfer } from '../../types/all';
import { greenThemeColors } from '../../utils/themeConfig';
import CompletedCounts from '../shared/CompletedCounts';
import SavingsList, { GoalTransferFilter } from './SavingsList';

export default async function SavingsPage({
  filter,
  newSaveText,
  saveHref,
  hide,
  bottomGoalTransfers,
  topGoalTransfers,
  goalsCompleted,
  totalSaved,
}: {
  filter?: GoalTransferFilter;
  newSaveText: string;
  totalSaved: number;
  goalsCompleted: number;
  saveHref: string;
  bottomGoalTransfers: GoalTransfer[];
  topGoalTransfers?: GoalTransfer[];
  hide?: boolean;
}) {
  let routeParams = '';
  if (filter === 'accounts') routeParams = '?filter=accounts';
  if (filter === 'templates') routeParams = '?filter=templates';

  return (
    <>
      <Space direction='vertical' style={{ width: '100%' }}>
        <Space
          direction='horizontal'
          style={{ justifyContent: 'center', width: '100%' }}
        >
          {!hide ? (
            <Link to={saveHref + routeParams}>
              <ConfigProvider
                theme={{
                  components: {
                    Button: greenThemeColors,
                  },
                }}
              >
                <Button
                  data-id='save-button'
                  type='primary'
                  size='large'
                  style={{ color: 'black' }}
                >
                  {newSaveText}
                </Button>
              </ConfigProvider>
            </Link>
          ) : null}
        </Space>
        <div>
          <CompletedCounts
            totalSaved={totalSaved}
            goalsCompleted={goalsCompleted}
          />
        </div>
        <SavingsList
          bottomGoalTransfers={bottomGoalTransfers}
          topGoalTransfers={topGoalTransfers}
          filter={filter}
          routeParams={routeParams}
        />
      </Space>
    </>
  );
}
