import { HappyProvider } from '@ant-design/happy-work-theme';
import { ConfigProvider, Space, Typography } from 'antd';
import React from 'react';

import useFetch from '../../hooks/useFetch';
import { greenThemeColors } from '../../utils/themeConfig';
import { QuickSaveButton } from './QuickSaveButton';

const { Text } = Typography;

export default function QuickSaveButtons({ userId }: { userId: string }) {
  const { data } = useFetch('api/pages/quickSaveButtons', 'POST', { userId });

  const { quickTransfers, goal } = data;
  if (!quickTransfers) return <Text>No Pinned One-Tap Saves.</Text>;
  if (!goal) return <Text>No Pinned Goal.</Text>;

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
            <QuickSaveButton transfer={transfer} goalId={goal.id} />
          </HappyProvider>
        ))}
      </Space>
    </ConfigProvider>
  );
}
