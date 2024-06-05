'use client';
import { Button, Card, Tour, TourProps } from 'antd';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

function useBeginTour(setOpen: (open: boolean) => void) {
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);
}
export default function ConnectPlaidCard() {
  const unreadRef = useRef(null);
  const [open, setOpen] = useState<boolean>(false);
  useBeginTour(setOpen);
  const steps: TourProps['steps'] = [
    {
      title: 'Review Transactions',
      description:
        'Connect your account now and begin reviewing your transactions here.',

      target: () => unreadRef.current,
    },
  ];
  return (
    <>
      <Link ref={unreadRef} href='/review'>
        <Card
          title={<span>Review Transactions</span>}
          headStyle={{ backgroundColor: '#f0f2f5', textAlign: 'center' }}
          bodyStyle={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '2rem',
          }}
        >
          <Button type='link'>Connect your bank to see transactions</Button>
        </Card>
      </Link>
      <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
    </>
  );
}
