import { HappyProvider } from '@ant-design/happy-work-theme';
import { ConfigProvider, Space, Typography } from 'antd';
import React from 'react';

import { greenThemeColors } from '../../utils/themeConfig';
import { GoalTransfer, QuickSaveButton } from './QuickSaveButton';

const { Text } = Typography;

export default function DashboardSaveButtons({
  quickTransfers,
  goalId,
}: {
  quickTransfers: GoalTransfer[];
  goalId: string;
}) {
  if (!quickTransfers) return <Text>No Pinned One-Tap Saves.</Text>;
  if (!goalId) return <Text>No Pinned Goal.</Text>;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: greenThemeColors.colorPrimary,
        },
      }}
    >
      <Space wrap>
        {quickTransfers.map((transfer) => (
          <HappyProvider key={transfer.id}>
            <QuickSaveButton transfer={transfer} goalId={goalId} />
          </HappyProvider>
        ))}
      </Space>
    </ConfigProvider>
  );
}
