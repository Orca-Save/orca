import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { getServerSession } from 'next-auth';
import { createSubscription } from '../(customerFacing)/user/_actions/stripe';
import { createLinkToken } from '../_actions/plaid';
import SignIn from '../_components/SignIn';
import OnboardingForm from './_components/OnboardingForm';

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <SignIn />;
  if (!isExtendedSession(session)) return <></>;
  const [subResponse, linkToken] = await Promise.all([
    createSubscription(session.user.id, session.user.email ?? ''),
    createLinkToken(session.user.id),
  ]);
  return (
    <OnboardingForm
      subResponse={subResponse}
      linkToken={linkToken.link_token}
    />
  );
}
