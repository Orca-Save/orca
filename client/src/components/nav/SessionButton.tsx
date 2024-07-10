'use client';
import { NavLink } from '@/components/Nav';
import { baseURL } from '@/lib/utils';
import { signIn, useSession } from 'next-auth/react';

export default function SessionButton() {
  const { data: session } = useSession();
  if (session) {
    return <NavLink href='/api/auth/signout'>Sign Out</NavLink>;
  }
  return (
    <button
      data-id='sign-in-button'
      onClick={() => signIn('azure-ad-b2c', { callbackUrl: baseURL + '/' })}
    >
      Sign In
    </button>
  );
}
