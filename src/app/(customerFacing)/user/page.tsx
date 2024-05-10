import SignIn from '@/app/_components/SignIn';
import { Title } from '@/app/_components/Typography';
import authOptions from '@/lib/nextAuthOptions';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';

export default async function UserPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <SignIn />;
  return (
    <>
      <Title>User Profile</Title>
      <div>
        <Link href='/user/subscriptions'>Subscriptions</Link>
      </div>
    </>
  );
}
