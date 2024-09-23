import { Flex, Skeleton } from 'antd';
import React from 'react';
import useFetch from '../../hooks/useFetch';
import OnboardingForm from './OnboardingForm';

export default function OnboardingPage() {
  const { data } = useFetch('api/pages/onboardingPage', 'GET');

  const {
    linkToken,
    userProfile,
    itemsData,
    onboardingProfile,
    stripeSubscription,
    isActiveSubscription,
    googleSubscription,
  } = data ?? {};
  if (!data) return <Skeleton active />;
  return (
    <Flex justify='center' className='w-full'>
      <OnboardingForm
        linkToken={linkToken.link_token}
        isActiveSubscription={isActiveSubscription}
        userProfile={userProfile}
        itemsData={itemsData}
        stripeSubscription={stripeSubscription}
        googleSubscription={googleSubscription}
        onboardingProfile={onboardingProfile}
      />
    </Flex>
  );
}
