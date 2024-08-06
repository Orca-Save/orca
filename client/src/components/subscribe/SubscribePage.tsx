import { useMsal } from '@azure/msal-react';
import { Typography } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import StripeForm from '../user/StripeForm';

const { Text } = Typography;

export default function SubscribePage() {
  const { accounts } = useMsal();
  const { data } = useFetch('api/pages/subscriptionPage', 'GET');
  if (!data) return null;
  const { userProfile } = data;
  const account = accounts[0];
  if (userProfile?.stripeSubscriptionId)
    return (
      <>
        <Text>
          You are already subscribed.{' '}
          <Link to='/user'>View your subscription</Link>
        </Text>
      </>
    );
  return (
    <StripeForm
      email={account.idTokenClaims?.emails?.[0] ?? ''}
      userId={account.localAccountId}
      redirect={true}
    />
  );
}
