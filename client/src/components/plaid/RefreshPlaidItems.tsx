import { SyncOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useState } from 'react';
import { apiFetch } from '../../utils/general';

export default function RefreshPlaidItems({ height }: { height: number }) {
  const [loading, setLoading] = useState(false);
  return (
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
  );
}
