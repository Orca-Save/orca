import React from 'react';
import ConnectPlaidCard from './ConnectPlaidCard';

export default function ConnectPlaid({ userId }: { userId: string }) {
  const linkToken = await createLinkToken(userId);

  return <ConnectPlaidCard linkToken={linkToken} userId={userId} />;
}
