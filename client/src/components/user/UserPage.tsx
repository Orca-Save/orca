import { useMsal } from '@azure/msal-react';
import { Button, Skeleton, Space, Typography } from 'antd';
import React from 'react';

import useFetch from '../../hooks/useFetch';
import Subscription from '../subscribe/Subscription';
import ClearUserData from './ClearUserData';
import ListItems from './ListItems';
import PlaidLink from './PlaidLink';
import { Link } from 'react-router-dom';

const { Title } = Typography;

export default function UserPage() {
  const { instance } = useMsal();
  const { data } = useFetch('api/pages/userPage', 'GET');
  if (!data)
    return (
      <>
        <Button type="primary" onClick={() => handleLogout()} size="large">
          Logout
        </Button>
        <Skeleton active />
      </>
    );
  const {
    linkToken,
    userProfile,
    stripeSubscription,
    googleSubscription,
    appleSubscription,
  } = data;
  const handleLogout = () => {
    instance.logoutPopup();
  };
  return (
    <>
      <Title>User Profile</Title>
      <Space direction="vertical" size="large">
        <Subscription
          userProfile={userProfile}
          stripeSubscription={stripeSubscription}
          googleSubscription={googleSubscription}
          appleSubscription={appleSubscription}
        />

        <ClearUserData />
        <div>
          <Title level={4}>Connect your banks with Plaid</Title>
          <PlaidLink linkToken={linkToken.link_token} />
          <ListItems />
        </div>
        <Button type="primary" onClick={() => handleLogout()} size="large">
          Logout
        </Button>
      </Space>
    </>
  );
}
