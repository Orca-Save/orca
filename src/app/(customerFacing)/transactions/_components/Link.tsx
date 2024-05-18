'use client';
import { usePlaidLink } from 'react-plaid-link';
import { exchangePublicToken } from '../_actions/plaid';
import { LinkProps } from './PlaidLink';

export const Link = (props: LinkProps) => {
  const onSuccess = async (public_token: string, metadata: unknown) => {
    await exchangePublicToken(public_token);
  };
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: props.linkToken!,
    onSuccess,
  };
  const { open, ready } = usePlaidLink(config);
  return (
    <button onClick={() => open()} disabled={!ready}>
      Link account
    </button>
  );
};
