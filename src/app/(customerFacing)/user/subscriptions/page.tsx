import db from '@/db/db';
import StripeForm from './_components/StripeForm';
import { isExtendedSession } from '@/lib/session';
import { useSession } from 'next-auth/react';
import SignIn from '@/app/_components/SignIn';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/nextAuthOptions';

const getUserProfile = (userId: string) => {
  return db.userProfile.findUnique({
    where: {
      userId,
    },
  });
};

async function StripePage() {
  const session = await getServerSession(authOptions);
  if (!session) return <SignIn />;
  if (!isExtendedSession(session)) return null;

  const userProfile = await getUserProfile(session.user.id);
  console.log(userProfile);

  return (
    <div>
      {userProfile?.stripeSubscriptionId ? (
        <>Cancel Sub</>
      ) : (
        <StripeForm userId={session.user.id} />
      )}
    </div>
  );
}

export default StripePage;
