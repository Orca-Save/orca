import { Text } from '@/app/_components/Typography';
import { greenCardThemeConfig } from '@/lib/themeConfig';
import { currencyFormatter } from '@/lib/utils';
import { Card, ConfigProvider, Space } from 'antd';

export default async function CompletedCounts({
  totalSaved,
  goalsCompleted,
}: {
  totalSaved: number;
  goalsCompleted: number;
}) {
  return (
    <Space
      direction='horizontal'
      size='large'
      style={{
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <ConfigProvider
        theme={{
          components: greenCardThemeConfig,
        }}
      >
        <Card>
          <Text>Total saved: {currencyFormatter(totalSaved)}</Text>{' '}
          <Text>Goals completed: {goalsCompleted}</Text>
        </Card>
      </ConfigProvider>
    </Space>
  );
}
