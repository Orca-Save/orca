import { Button, ConfigProvider, Skeleton, Space, Typography } from 'antd';
import * as emoji from 'node-emoji';

import { HappyProvider } from '@ant-design/happy-work-theme';
import { useMsal } from '@azure/msal-react';
import React from 'react';
import useFetch from '../../hooks/useFetch';
import { greenThemeColors } from '../../utils/themeConfig';
import QuickSaveButtons from './DashQuickSave';

const { Title } = Typography;

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
  // const { error, execute } = useFetchWithMsal();

  // const [todoListData, setTodoListData] = useState(null);

  // useEffect(() => {
  //   if (!todoListData) {
  //     execute('GET', 'http://localhost:3001/').then((response) => {
  //       console.log('response', response);
  //       // setTodoListData(response);
  //     });
  //   }
  // }, [execute, todoListData]);
  const { accounts } = useMsal();
  const userId = accounts[0].localAccountId;
  const { data } = useFetch('api/pages/dashboardPage', 'POST', {
    userId,
  });
  const { onboardingProfileCount, unreadObj, userProfile } = data;

  return (
    <div className='flex justify-center'>
      {/* <ConfettiComp run={searchParams?.confetti === 'true'} path='/' /> */}
      <Space direction='vertical' style={{ width: '100%' }}>
        <Title level={4} style={{ margin: 0 }}>
          Focus Goal
        </Title>
        <Skeleton paragraph={{ rows: 4 }}>
          {/* <DynamicPinnedGoal userId={userId} /> */}
        </Skeleton>
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
        <Skeleton paragraph={{ rows: 4 }}>
          <QuickSaveButtons userId={userId} />
        </Skeleton>
      </Space>
    </div>
  );
}
