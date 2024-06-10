'use client';

import { Title } from '@/app/_components/Typography';
import { Button, Popconfirm } from 'antd';
import { clearUserData } from '../_actions/userActions';

export default function ClearUserData({ userId }: { userId: string }) {
  return (
    <div>
      <Title level={4}>Clear all data</Title>
      <p>
        This will clear all data associated with your account. This action
        cannot be undone.
      </p>
      <Popconfirm
        title='Delete the task'
        description='Are you sure you want to delete your user data?'
        onConfirm={() => () => clearUserData(userId)}
        okText='Yes'
        cancelText='No'
      >
        <Button data-id='clear-data-button' type='primary' size='large' danger>
          Clear Data
        </Button>
      </Popconfirm>
    </div>
  );
}
