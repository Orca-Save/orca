import React from 'react';
import useFetch from '../../hooks/useFetch';
import ConnectPlaidCard from './ConnectPlaidCard';

export default function ConnectPlaid({ userId }: { userId: string }) {
  const { data } = useFetch('api/plaid/linkToken', 'GET');
  if (!data) return null;
  const { linkToken } = data;
  return <ConnectPlaidCard linkToken={linkToken} userId={userId} />;
}
