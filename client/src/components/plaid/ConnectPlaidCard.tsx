import { Card, Tour, TourProps } from 'antd';
import * as emoji from 'node-emoji';
import React, { useEffect, useRef, useState } from 'react';
import PlaidLink from '../user/PlaidLink';

function useBeginTour(setOpen: (open: boolean) => void) {
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);
}

type LinkTokenCreateResponse = {
  link_token: string;
};

export default function ConnectPlaidCard({
  linkToken,
  userId,
}: {
  linkToken: LinkTokenCreateResponse;
  userId: string;
}) {
  const unreadRef = useRef(null);
  const [open, setOpen] = useState<boolean>(false);
  useBeginTour(setOpen);
  const steps: TourProps['steps'] = [
    {
      title: 'Review Transactions',
      description:
        'Connect your account now and begin reviewing your purchases here. Go to your profile page to connect more accounts.',

      target: () => unreadRef.current,
    },
  ];
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
        <PlaidLink linkToken={linkToken.link_token} userId={userId} />
      </Card>
      <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
    </>
  );
}
