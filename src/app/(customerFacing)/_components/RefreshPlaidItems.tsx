'use client';

import { refreshUserItems } from '@/app/_actions/plaid';
import { SyncOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RefreshPlaidItems({
  height,
  userId,
}: {
  height: number;
  userId: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
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
          router.refresh();
        } catch (error) {}
        setLoading(false);
      }}
      style={{ height, width: height, marginRight: '0.5rem' }}
    />
  );
}
