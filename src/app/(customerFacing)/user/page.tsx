import SignIn from '@/app/_components/SignIn';
import { Title } from '@/app/_components/Typography';
import authOptions from '@/lib/nextAuthOptions';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import Subscription from './_components/Subscription';
import { Button, Space } from 'antd';

export default async function UserPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <SignIn />;
  return (
    <>
      <Title>User Profile</Title>
      <Space direction='vertical' size='large'>
        <div>
          <Subscription />
        </div>

        <Link href='/api/auth/signout'>
          <Button>Logout</Button>
        </Link>
      </Space>
    </>
  );
}
