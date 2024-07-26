import { HappyProvider } from '@ant-design/happy-work-theme';
import { useMsal } from '@azure/msal-react';
import { Button, ConfigProvider, Skeleton, Space, Typography } from 'antd';
import * as emoji from 'node-emoji';
import React from 'react';

import { useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { greenThemeColors } from '../../utils/themeConfig';
import DashboardSaveButtons from './DashQuickSave';

const { Title } = Typography;

export default function HomePage() {
  // const session = await getServerSession(authOptions);
  // if (!session) redirect('/signup');
  // if (!isExtendedSession(session)) redirect('/signup');
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
  console.log('data', data);
  if (onboardingProfileCount === 0 || !userProfile?.privacyPolicyAccepted)
    // console.log('navigate to onboarding');
    navigate('/onboarding');

  return (
    <div className='flex justify-center'>
      {/* <ConfettiComp run={searchParams?.confetti === 'true'} path='/' /> */}
      <Space direction='vertical' style={{ width: '100%' }}>
        <Title level={4} style={{ margin: 0 }}>
          Focus Goal
        </Title>
        <Skeleton paragraph={{ rows: 4 }}>
          <DynamicPinnedGoal userId={userId} />
        </Skeleton>
        {/* <Link to='/savings/new'> */}
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
        {/* </Link> */}
        {/* <ReviewLink unreadObj={unreadObj} userId={userId} /> */}
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
