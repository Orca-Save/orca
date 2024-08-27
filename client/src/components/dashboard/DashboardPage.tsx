import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { Skeleton } from 'antd';
import { useNavigate } from 'react-router-dom';

import useFetch from '../../hooks/useFetch';
import Dashboard from './Dashboard';

export default function HomePage() {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();

  const { accounts } = useMsal();
  const userId = accounts[0]?.localAccountId;
  const { data } = useFetch('api/pages/dashboardPage', 'POST', {
    userId,
  });
  if (!isAuthenticated) navigate('/sign-in');
  if (!data) return <Skeleton active />;
  const { onboardingProfileCount, userProfile } = data;
  if (
    onboardingProfileCount === 0 ||
    !userProfile?.privacyPolicyAccepted ||
    !userProfile?.stripeSubscriptionId
  )
    navigate('/onboarding');
  return (
    <Dashboard
      goal={data.goal}
      quickTransfers={data.quickTransfers}
      userTour={data.userTour}
      unreadTransactionCount={data.unreadTransactionCount}
      completedCounts={data.completedCounts}
    />
  );
}
