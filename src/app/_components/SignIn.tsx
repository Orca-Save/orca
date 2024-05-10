'use client';

import { signIn, useSession } from 'next-auth/react';

export default function SignIn() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      signIn('azure-ad-b2c');
    },
  });
  return <></>;
}
