import { Button, ConfigProvider, Space, Typography } from 'antd';
import * as emoji from 'node-emoji';

import { HappyProvider } from '@ant-design/happy-work-theme';
import React from 'react';
import useFetch from '../../hooks/fetch';
import { greenThemeColors } from '../../utils/themeConfig';

const { Title } = Typography;

// const DynamicPinnedGoal = dynamic(() => import('/DashGoalCard'), {
//   loading: () => <Skeleton paragraph={{ rows: 4 }} />,
// });
// const DynamicQuickSave = dynamic(() => import('/DashQuickSave'), {
//   loading: () => <Skeleton paragraph={{ rows: 4 }} />,
// });

export default function HomePage() {
  // const session = await getServerSession(authOptions);
  // if (!session) redirect('/signup');
  // if (!isExtendedSession(session)) redirect('/signup');

  // const [onboardingProfileCount, unreadObj, userProfile] = await Promise.all([
  //   getOnboardingProfileCount(session.user.id),
  //   // getUnreadTransactionCount(session.user.id),
  //   // getUserProfile(session.user.id),
  // ]);
  // if (
  //   session.isNewUser ||
  //   onboardingProfileCount === 0 ||
  //   !userProfile?.privacyPolicyAccepted
  // )
  //   redirect('/onboarding');
  const data = useFetch('/api/user/onboardingProfileCount');
  console.log(data);

  return (
    <div className='flex justify-center'>
      {/* <ConfettiComp run={searchParams?.confetti === 'true'} path='/' /> */}
      <Space direction='vertical' style={{ width: '100%' }}>
        <Title level={4} style={{ margin: 0 }}>
          Focus Goal
        </Title>
        {/* <DynamicPinnedGoal userId={session.user.id} /> */}
        {/* <Link href='/savings/new'> */}
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

        {/* <ReviewLink unreadObj={unreadObj} userId={session.user.id} /> */}
        <Title level={4} style={{ margin: 0 }}>
          One-Tap Impulse Saves
        </Title>

        {/* <DynamicQuickSave userId={session.user.id} /> */}
      </Space>
    </div>
  );
}
