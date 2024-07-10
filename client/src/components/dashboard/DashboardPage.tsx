import { Button, ConfigProvider, Skeleton, Space, Typography } from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import * as emoji from 'node-emoji';

import { HappyProvider } from '@/components/HappyProvider';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { greenThemeColors } from '@/lib/themeConfig';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

const { Title } = Typography;

const DynamicPinnedGoal = dynamic(() => import('/DashGoalCard'), {
  loading: () => <Skeleton paragraph={{ rows: 4 }} />,
});
const DynamicQuickSave = dynamic(() => import('/DashQuickSave'), {
  loading: () => <Skeleton paragraph={{ rows: 4 }} />,
});

const getOnboardingProfileCount = (userId: string) => {
  return db.onboardingProfile.count({
    where: {
      userId: userId,
    },
  });
};
export default async function HomePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/signup');
  if (!isExtendedSession(session)) redirect('/signup');

  const [onboardingProfileCount, unreadObj, userProfile] = await Promise.all([
    getOnboardingProfileCount(session.user.id),
    getUnreadTransactionCount(session.user.id),
    getUserProfile(session.user.id),
  ]);
  if (
    session.isNewUser ||
    onboardingProfileCount === 0 ||
    !userProfile?.privacyPolicyAccepted
  )
    redirect('/onboarding');

  return (
    <div className='flex justify-center'>
      <ConfettiComp run={searchParams?.confetti === 'true'} path='/' />
      <Space direction='vertical' style={{ width: '100%' }}>
        <Title level={4} style={{ margin: 0 }}>
          Focus Goal
        </Title>
        <DynamicPinnedGoal userId={session.user.id} />
        <Link href='/savings/new'>
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

        <ReviewLink unreadObj={unreadObj} userId={session.user.id} />
        <Title level={4} style={{ margin: 0 }}>
          One-Tap Impulse Saves
        </Title>

        <DynamicQuickSave userId={session.user.id} />
      </Space>
    </div>
  );
}
