import { SyncOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useState } from 'react';

export default function RefreshPlaidItems({
  height,
  userId,
}: {
  height: number;
  userId: string;
}) {
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
          await refreshUserItems(userId);
          window.location.reload();
        } catch (error) {}
        setLoading(false);
      }}
      style={{ height, width: height, marginRight: '0.5rem' }}
    />
  );
}
