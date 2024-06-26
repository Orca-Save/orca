'use client';

import { refreshUserItems } from '@/app/_actions/plaid';
import { Paragraph } from '@/app/_components/Typography';
import { SyncOutlined } from '@ant-design/icons';
import { Button, Modal, Tooltip } from 'antd';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RefreshPlaidItems({
  height,
  nextRefreshTime,
  userId,
}: {
  height: number;
  nextRefreshTime: Date | null;
  userId: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const disabled: any = nextRefreshTime && nextRefreshTime > new Date();
  const nextTime = nextRefreshTime
    ? format(nextRefreshTime, 'EEE, h:mm a').toUpperCase()
    : 'Unknown time';
  const nextRefreshMessage = `No new transactions were found. Another refresh can be performed in 12 hours (${nextTime}).`;
  return (
    <>
      <Tooltip title={disabled ? '' : nextRefreshMessage}>
        <Button
          size='large'
          loading={loading}
          disabled={disabled}
          icon={<SyncOutlined />}
          onClick={async () => {
            setLoading(true);
            try {
              const { changes } = await refreshUserItems(userId);
              if (changes) router.refresh();
              else setIsModalOpen(true);
            } catch (error) {
              setIsModalOpen(true);
            }
            setLoading(false);
          }}
          style={{ height, width: height, marginRight: '0.5rem' }}
        />
      </Tooltip>
      <Modal
        title='No new transactions found'
        open={isModalOpen}
        cancelButtonProps={{ style: { display: 'none' } }}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => setIsModalOpen(false)}
      >
        <Paragraph>{nextRefreshMessage}</Paragraph>
      </Modal>
    </>
  );
}
