import SignIn from '@/app/_components/SignIn';
import { Text } from '@/app/_components/Typography';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { createSubscription } from '../user/_actions/stripe';
import StripeForm from '../user/_components/StripeForm';

export default async function SubscribePage() {
  const session = await getServerSession(authOptions);
  if (!session) return <SignIn />;
  if (!isExtendedSession(session)) return <></>;
  const [subResponse] = await Promise.all([
    createSubscription(session.user.id, session.user.email ?? ''),
  ]);
  const userProfile = subResponse?.userProfile;

  if (userProfile?.stripeSubscriptionId)
    return (
      <>
        <Text>
          You are already subscribed.{' '}
          <Link href='/user'>View your subscription</Link>
        </Text>
      </>
    );
  if (!subResponse || !subResponse.clientSecret || !subResponse.subscriptionId)
    return <Text>Something went wrong. Please try again later.</Text>;
  return (
    <StripeForm
      userId={session.user.id}
      email={session.user.email ?? ''}
      clientSecret={subResponse?.clientSecret}
      subscriptionId={subResponse?.subscriptionId}
    />
  );
}
