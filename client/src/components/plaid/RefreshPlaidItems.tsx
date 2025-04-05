import { SyncOutlined } from '@ant-design/icons';
import { Button, ConfigProvider } from 'antd';
import { useState } from 'react';
import { apiFetch } from '../../utils/general';
import { antdDefaultButton } from '../../utils/themeConfig';

export default function RefreshPlaidItems({ height }: { height: number }) {
  const [loading, setLoading] = useState(false);
  return (
    <ConfigProvider
      theme={{
        components: {
          Button: antdDefaultButton,
        },
      }}
    >
      <Button
        data-id='refresh-plaid-items'
        size='large'
        loading={loading}
        icon={<SyncOutlined />}
        onClick={async () => {
          setLoading(true);
          try {
            await apiFetch('/api/plaid/refreshItems', 'GET');
            window.location.reload();
          } catch (error) {}
          setLoading(false);
        }}
        style={{ height, width: height, marginRight: '0.5rem' }}
      />
    </ConfigProvider>
  );
}
