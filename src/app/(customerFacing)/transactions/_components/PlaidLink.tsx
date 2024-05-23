'use client';
import { usePlaidLink } from 'react-plaid-link';
import { exchangePublicToken } from '../_actions/plaid';

interface LinkProps {
  linkToken: string | null;
  userId: string;
}
const Link = (props: LinkProps) => {
  const onSuccess = async (public_token: string, metadata: unknown) => {
    await exchangePublicToken(public_token, props.userId);
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

Link.displayName = 'Link';

export default Link;
