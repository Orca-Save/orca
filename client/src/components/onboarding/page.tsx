import OnboardingForm from './_components/OnboardingForm';
import React from 'react';

export default function OnboardingPage() {
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
