import { createLinkToken } from '@/app/_actions/plaid';
import SignIn from '@/app/_components/SignIn';
import { Title } from '@/app/_components/Typography';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { Button, Space } from 'antd';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import ClearUserData from './_components/ClearUserData';
import ListItems from './_components/ListItems';
import PlaidLink from './_components/PlaidLink';
import Subscription from './_components/Subscription';

export default async function UserPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <SignIn />;
  if (!isExtendedSession(session)) return <SignIn />;
  const linkToken = await createLinkToken(session.user.id);
  return (
    <>
      <Title>User Profile</Title>
      <Space direction='vertical' size='large'>
        <div>
          <Subscription />
        </div>

        <ClearUserData userId={session.user.id} />
        <div>
          <Title level={4}>Connect your banks with Plaid</Title>
          <PlaidLink
            linkToken={linkToken.link_token}
            userId={session.user.id}
          />
          <ListItems userId={session.user.id} />
        </div>
        <Link href='/api/auth/signout'>
          <Button size='large'>Logout</Button>
        </Link>
      </Space>
    </>
  );
}
