import React from 'react';
import useFetch from '../../hooks/useFetch';
import OnboardingForm from './OnboardingForm';

export default function OnboardingPage() {
  const { data } = useFetch('api/pages/onboardingPage', 'GET');

  const { linkToken, userProfile, itemsData, onboardingProfile } = data ?? {};
  if (!data) return null;
  return (
    <OnboardingForm
      linkToken={linkToken.link_token}
      userProfile={userProfile}
      itemsData={itemsData}
      onboardingProfile={onboardingProfile}
    />
  );
}
