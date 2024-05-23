import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { createLinkToken, getTransactions } from './_actions/plaid';
import PlaidLink from './_components/PlaidLink';
import TransactionsList from './_components/TransactionsList';

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !isExtendedSession(session)) redirect('/');

  const [linkTokenData, transactions] = await Promise.all([
    createLinkToken(session.user.id),
    getTransactions(session.user.id, '2023-04-14', '2024-04-17'),
  ]);
  return (
    <>
      Plaid
      <PlaidLink
        linkToken={linkTokenData.link_token}
        userId={session.user.id}
      />
      <TransactionsList transactions={transactions} />
    </>
  );
}
