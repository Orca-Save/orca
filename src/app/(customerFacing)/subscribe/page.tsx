import SignIn from '@/app/_components/SignIn';
import { Text } from '@/app/_components/Typography';
import { getUserProfile } from '@/db/common';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import StripeForm from '../user/_components/StripeForm';

export default async function SubscribePage() {
  const session = await getServerSession(authOptions);
  if (!session) return <SignIn />;
  if (!isExtendedSession(session)) return <></>;
  const [userProfile] = await Promise.all([getUserProfile(session.user.id)]);
  if (userProfile?.stripeSubscriptionId)
    return (
      <>
        <Text>
          You are already subscribed.{' '}
          <Link href='/user'>View your subscription</Link>
        </Text>
      </>
    );
  return (
    <StripeForm
      email={session.user.email ?? ''}
      userId={session.user.id}
      redirect={true}
    />
  );
}
