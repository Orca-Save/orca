import { HappyProvider } from '@ant-design/happy-work-theme';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { Button, ConfigProvider, Skeleton, Space, Typography } from 'antd';
import * as emoji from 'node-emoji';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import useFetch from '../../hooks/useFetch';
import { greenThemeColors } from '../../utils/themeConfig';
import ReviewLink from '../plaid/ReviewLink';
import ConfettiComp from '../shared/Confetti';
import DashGoalCard from './DashGoalCard';
import DashboardSaveButtons from './DashQuickSave';

const { Title } = Typography;

export default function HomePage() {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  const { accounts } = useMsal();
  const [searchParams, setSearchParams] = useSearchParams();

  const userId = accounts[0]?.localAccountId;
  const { data } = useFetch('api/pages/dashboardPage', 'POST', {
    userId,
  });
  if (!isAuthenticated) navigate('/sign-in');
  if (!data) return <Skeleton active />;
  const {
    onboardingProfileCount,
    quickTransfers,
    goal,
    unreadTransactionCount,
    userProfile,
    completedCounts,
  } = data;
  if (onboardingProfileCount === 0 || !userProfile?.privacyPolicyAccepted)
    navigate('/onboarding');
  const addGoalCurrentBalance = (amount: number) => {
    goal.currentBalance += amount;
  };
  return (
    <div className='flex justify-center'>
      <ConfettiComp run={searchParams.get('confetti') === 'true'} path='/' />
      <Space direction='vertical' style={{ width: '100%' }}>
        <Title level={4} style={{ margin: 0 }}>
          Focus Goal
        </Title>
        <DashGoalCard completedCounts={completedCounts} goal={goal} />
        <Link to='/savings/new'>
          <ConfigProvider
            theme={{
              components: {
                Button: greenThemeColors,
              },
            }}
          >
            <HappyProvider>
              <Button
                data-id='dash-impulse-save-nav'
                size='large'
                type='primary'
                style={{
                  width: '100%',
                  height: '90px',
                  color: 'black',
                }}
              >
                <strong>
                  <span className='pr-2'>Impulse Save</span>
                </strong>
                {emoji.find('money_mouth_face')?.emoji}
              </Button>
            </HappyProvider>
          </ConfigProvider>
        </Link>
        <ReviewLink unreadObj={unreadTransactionCount} />
        <Title level={4} style={{ margin: 0 }}>
          One-Tap Impulse Saves
        </Title>
        <DashboardSaveButtons
          addGoalCurrentBalance={addGoalCurrentBalance}
          goalId={goal.id}
          quickTransfers={quickTransfers}
        />
      </Space>
    </div>
  );
}
