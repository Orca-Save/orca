import { HappyProvider } from '@ant-design/happy-work-theme';
import { useMsal } from '@azure/msal-react';
import { Button, ConfigProvider, Skeleton, Space, Typography } from 'antd';
import * as emoji from 'node-emoji';
import React from 'react';

import { Link, useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { greenThemeColors } from '../../utils/themeConfig';
import ReviewLink from '../plaid/ReviewLink';
import DashGoalCard from './DashGoalCard';
import DashboardSaveButtons from './DashQuickSave';

const { Title } = Typography;

export default function HomePage() {
  const navigate = useNavigate();
  const { accounts } = useMsal();
  const userId = accounts[0]?.localAccountId;
  const { data } = useFetch('api/pages/dashboardPage', 'POST', {
    userId,
  });
  if (!data) return <Skeleton active />;
  const {
    onboardingProfileCount,
    quickTransfers,
    goal,
    unreadTransactionCount,
    userProfile,
  } = data;
  if (onboardingProfileCount === 0 || !userProfile?.privacyPolicyAccepted)
    navigate('/onboarding');

  return (
    <div className='flex justify-center'>
      {/* <ConfettiComp run={searchParams?.confetti === 'true'} path='/' /> */}
      <Space direction='vertical' style={{ width: '100%' }}>
        <Title level={4} style={{ margin: 0 }}>
          Focus Goal
        </Title>
        <DashGoalCard />
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
        <ReviewLink unreadObj={unreadTransactionCount} userId={userId} />
        <Title level={4} style={{ margin: 0 }}>
          One-Tap Impulse Saves
        </Title>
        <DashboardSaveButtons
          goalId={goal.id}
          quickTransfers={quickTransfers}
        />
      </Space>
    </div>
  );
}
