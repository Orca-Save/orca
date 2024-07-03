import { createLinkToken } from '@/app/_actions/plaid';
import ConnectPlaidCard from './ConnectPlaidCard';

export default async function ConnectPlaid({ userId }: { userId: string }) {
  const linkToken = await createLinkToken(userId);

  return <ConnectPlaidCard linkToken={linkToken} userId={userId} />;
}
