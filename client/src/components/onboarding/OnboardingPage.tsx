import { Flex } from 'antd';
import React from 'react';
import useFetch from '../../hooks/useFetch';
import OnboardingForm from './OnboardingForm';

export default function OnboardingPage() {
  const { data } = useFetch('api/pages/onboardingPage', 'GET');

  const { linkToken, userProfile, itemsData, onboardingProfile } = data ?? {};
  if (!data) return null;
  return (
    <Flex justify='center' className='w-full'>
      <OnboardingForm
        linkToken={linkToken.link_token}
        userProfile={userProfile}
        itemsData={itemsData}
        onboardingProfile={onboardingProfile}
      />
    </Flex>
  );
}
