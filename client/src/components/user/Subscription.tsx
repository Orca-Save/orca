import { Button } from 'antd';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import React from 'react';
import UpdateSubscriptionForm from './UpdateSubscriptionForm';

export default function Subscription() {
  const session = await getServerSession(authOptions);
  if (!session) return <SignIn />;
  if (!isExtendedSession(session)) return <React.Fragment />;
  dayjs.extend(localizedFormat);

  const [userProfile, subscription] = await Promise.all([
    getUserProfile(session.user.id),
    getSubscription(session.user.id),
  ]);

  if (userProfile?.stripeSubscriptionId) {
    return (
      <>
        <Title level={4}>Subscription</Title>
        <div>
          <Text>
            Next Bill Date:{' '}
            {dayjs(subscription!.current_period_end * 1000).format('ll')}
          </Text>
        </div>
        <div>
          <Text>Rate: $4/month</Text>
        </div>
        <div>
          <Text>
            Status:{' '}
            {subscription?.cancel_at_period_end
              ? 'Cancel at end of period'
              : 'Active'}
          </Text>
        </div>
        <UpdateSubscriptionForm
          userId={session.user.id}
          cancel={!subscription?.cancel_at_period_end}
          actionText={
            subscription?.cancel_at_period_end
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

      <Link href='/subscribe'>
        <Button data-id='subscription-nav-button' type='primary' size='large'>
          Begin Subscription
        </Button>
      </Link>
    </>
  );
}
