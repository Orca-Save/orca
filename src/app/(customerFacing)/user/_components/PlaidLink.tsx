'use client';
import { Button } from 'antd';
import { usePlaidLink } from 'react-plaid-link';
import { exchangePublicToken } from '../../../_actions/plaid';

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
    <Button
      data-id='plaid-link-button'
      type='primary'
      size='large'
      onClick={() => open()}
      disabled={!ready}
    >
      Link account
    </Button>
  );
};

Link.displayName = 'Link';

export default Link;
