import { Card, ConfigProvider, Space, Typography } from 'antd';
import { greenCardThemeConfig } from '../../utils/themeConfig';

const { Text } = Typography;

export default async function CompletedCounts({
  totalSaved,
  goalsCompleted,
}: {
  totalSaved: number;
  goalsCompleted: number;
}) {
  function currencyFormatter(totalSaved: number) {
    throw new Error('Function not implemented.');
  }

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
