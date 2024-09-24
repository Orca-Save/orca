import { Card } from 'antd';
import * as emoji from 'node-emoji';
import { useRef } from 'react';

import PlaidLink from '../user/PlaidLink';

type LinkTokenCreateResponse = {
  link_token: string;
};

export default function ConnectPlaidCard({
  linkToken,
}: {
  linkToken: LinkTokenCreateResponse;
}) {
  const unreadRef = useRef(null);
  return (
    <>
      <Card
        ref={unreadRef}
        title={
          <span>
            Review Transactions {emoji.find('money_with_wings')?.emoji}
          </span>
        }
        headStyle={{ backgroundColor: '#f0f2f5', textAlign: 'center' }}
        bodyStyle={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '2rem',
        }}
      >
        <PlaidLink linkToken={linkToken.link_token} />
      </Card>
    </>
  );
}
