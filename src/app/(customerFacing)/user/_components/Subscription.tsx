import db from '@/db/db';
import StripeForm from './StripeForm';
import { isExtendedSession } from '@/lib/session';
import SignIn from '@/app/_components/SignIn';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/nextAuthOptions';
import UpdateSubscriptionForm from './UpdateSubscriptionForm';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { Text } from '@/app/_components/Typography';
import { getSubscription } from '../_actions/stripe';
import React from 'react';

const getUserProfile = (userId: string) => {
  return db.userProfile.findUnique({
    where: {
      userId,
    },
  });
};

export default async function Subscription() {
  const session = await getServerSession(authOptions);
  if (!session) return <SignIn />;
  if (!isExtendedSession(session)) return <React.Fragment />;
  dayjs.extend(localizedFormat);

  const [userProfile, subscription] = await Promise.all([
    getUserProfile(session.user.id),
    getSubscription(session.user.id),
  ]);
  return (
    <div>
      {userProfile?.stripeSubscriptionId ? (
        <>
          <div>
            <Text>
              Period End:{' '}
              {dayjs(subscription!.current_period_end * 1000).format('ll')}
            </Text>
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
      ) : (
        <StripeForm userId={session.user.id} email={session.user.email ?? ''} />
      )}
    </div>
  );
}
