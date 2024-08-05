import { Button, Space, Typography } from 'antd';
import React from 'react';
import ClearUserData from './ClearUserData';
import ListItems from './ListItems';
import PlaidLink from './PlaidLink';

const { Title } = Typography;

export default function UserPage() {
  const linkToken = await createLinkToken(session.user.id);
  return (
    <>
      <Title>User Profile</Title>
      <Space direction='vertical' size='large'>
        <div>{/* <Subscription /> */}</div>

        <ClearUserData />
        <div>
          <Title level={4}>Connect your banks with Plaid</Title>
          <PlaidLink
            linkToken={linkToken.link_token}
            userId={session.user.id}
          />
          <ListItems userId={session.user.id} />
        </div>
        <Link href='/api/auth/signout'>
          <Button data-id='sign-out-button' size='large'>
            Logout
          </Button>
        </Link>
      </Space>
    </>
  );
}
