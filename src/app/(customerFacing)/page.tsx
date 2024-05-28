import { Badge, Button, Card, ConfigProvider, Skeleton, Space } from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import * as emoji from 'node-emoji';

import { HappyProvider } from '@/components/HappyProvider';
import db from '@/db/db';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { greenThemeColors } from '@/lib/themes';
import { MailOutlined } from '@ant-design/icons';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { getUnreadTransactionCount } from '../_actions/users';
import { Title } from '../_components/Typography';
import ConfettiComp from './_components/Confetti';

const DynamicPinnedGoal = dynamic(() => import('./_components/DashGoalCard'), {
  loading: () => <Skeleton paragraph={{ rows: 4 }} />,
});
const DynamicQuickSave = dynamic(() => import('./_components/DashQuickSave'), {
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

  const [onboardingProfileCount, unreadObj] = await Promise.all([
    getOnboardingProfileCount(session.user.id),
    getUnreadTransactionCount(session.user.id),
  ]);
  if (session.isNewUser || onboardingProfileCount === 0)
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
                size='large'
                type='primary'
                style={{
                  width: '100%',
                  height: '90px',
                  color: 'black',
                  fontWeight: 'bold',
                }}
              >
                <span style={{ paddingRight: '1rem' }}>Impulse Save</span>
                {emoji.find('money_mouth_face')?.emoji}
              </Button>
            </HappyProvider>
          </ConfigProvider>
        </Link>

        {unreadObj.plaidItemExist ? (
          <Link href='/review'>
            <Card
              title={
                unreadObj.unreadCount ? (
                  <span>Unread Transactions</span>
                ) : (
                  <span>All transactions reviewed</span>
                )
              }
              headStyle={{ backgroundColor: '#f0f2f5', textAlign: 'center' }}
              bodyStyle={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '2rem',
              }}
            >
              <Badge count={unreadObj.unreadCount} overflowCount={99}>
                <MailOutlined style={{ fontSize: '3rem', color: '#08c' }} />
              </Badge>
            </Card>
          </Link>
        ) : (
          <Link href='/user'>
            <Button type='link'>Connect your bank to see transactions</Button>
          </Link>
        )}
        <Title level={4} style={{ margin: 0 }}>
          One-Tap Impulse Saves
        </Title>

        <DynamicQuickSave userId={session.user.id} />
      </Space>
    </div>
  );
}
