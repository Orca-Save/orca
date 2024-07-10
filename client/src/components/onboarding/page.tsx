import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { getServerSession } from 'next-auth';
import { getUserProfile } from '../../../../server/src/utils/db/common';
import { createLinkToken, getAllLinkedItems } from '../_actions/plaid';
import SignIn from '../_components/SignIn';
import { getOnboardingProfile } from './_actions/onboarding';
import OnboardingForm from './_components/OnboardingForm';

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <SignIn />;
  if (!isExtendedSession(session)) return <></>;
  const [linkToken, userProfile, linkedItems, onboardingProfile] =
    await Promise.all([
      createLinkToken(session.user.id),
      getUserProfile(session.user.id),
      getAllLinkedItems(session.user.id),
      getOnboardingProfile(session.user.id),
    ]);
  return (
    <OnboardingForm
      linkToken={linkToken.link_token}
      userProfile={userProfile}
      itemsData={linkedItems}
      onboardingProfile={onboardingProfile}
    />
  );
}
