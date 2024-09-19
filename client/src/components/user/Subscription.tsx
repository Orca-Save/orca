import { Button, Typography } from 'antd';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import React from 'react';
import { Link } from 'react-router-dom';

import { Capacitor } from '@capacitor/core';
import Pay from '../../plugins/payPlugin';
import { UserProfile } from '../../types/all';
import { apiFetch } from '../../utils/general';
import UpdateSubscriptionForm from './UpdateSubscriptionForm';
//@ts-ignore
import { ReactComponent as GooglePay } from './googlePay.svg';

const { Title, Text } = Typography;

export default function Subscription({
  userProfile,
  stripeSubscription,
  googleSubscription,
}: {
  userProfile: UserProfile;
  stripeSubscription: any;
  googleSubscription: any;
}) {
  dayjs.extend(localizedFormat);
  const platform = Capacitor.getPlatform();

  if (platform === 'android') {
    if (googleSubscription && googleSubscription?.cancelReason === undefined)
      return (
        <Button
          onClick={async () => {
            await apiFetch('/api/users/cancelGoogleSub', 'GET');
            window.location.reload();
          }}
        >
          Cancel
        </Button>
      );
    else
      return (
        <div>
          <Title level={4}>Subscription</Title>
          Subscribe to link your bank
          <GooglePay
            style={{ height: 70 }}
            onClick={async () => {
              try {
                await Pay.subscribe({
                  // @ts-ignore
                  productId: process.env.REACT_APP_GOOGLE_PRODUCT_ID!,
                  backendURL:
                    // @ts-ignore
                    process.env.REACT_APP_API_URL! +
                    '/api/users/setGoogleSubscriptionToken',
                  accessToken: localStorage.getItem('accessToken')!,
                });
                window.location.reload();
              } catch (err) {
                console.error(err);
              }
            }}
          />
        </div>
      );
  } else if (userProfile?.stripeSubscriptionId) {
    return (
      <>
        <Title level={4}>Subscription</Title>
        <div>
          <Text>
            Next Bill Date:{' '}
            {dayjs(stripeSubscription!.current_period_end * 1000).format('ll')}
          </Text>
        </div>
        <div>
          <Text>Rate: $4/month</Text>
        </div>
        <div>
          <Text>
            Status:{' '}
            {stripeSubscription?.cancel_at_period_end
              ? 'Cancel at end of period'
              : 'Active'}
          </Text>
        </div>
        <UpdateSubscriptionForm
          cancel={!stripeSubscription?.cancel_at_period_end}
          actionText={
            stripeSubscription?.cancel_at_period_end
              ? 'Continue Subscription'
              : 'Stop Subscription'
          }
        />
      </>
    );
  }

  return (
    <>
      <Title level={4}>Subscription</Title>
      <div>
        <Text>
          You are not currently subscribed. Subscribe and cancel at anytime.
        </Text>
      </div>

      <Link to='/subscribe'>
        <Button data-id='subscription-nav-button' type='primary' size='large'>
          Begin Subscription
        </Button>
      </Link>
    </>
  );
}
