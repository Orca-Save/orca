import { Button, Popconfirm, Typography } from 'antd';
import React from 'react';

import { apiFetch } from '../../utils/general';

const { Title } = Typography;

export default function ClearUserData() {
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
        onConfirm={() => async () => {
          await apiFetch('/api/user/clearUserData', 'GET');
          window.location.reload();
        }}
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
