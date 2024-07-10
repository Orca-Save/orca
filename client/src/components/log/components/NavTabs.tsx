'use client';

import { Tabs, TabsProps } from 'antd';
import { usePathname, useRouter } from 'next/navigation';

export default function NavTabs() {
  const pathname = usePathname();
  const router = useRouter();

  const items: TabsProps['items'] = [
    {
      key: '/log/saves',
      label: 'Impulse Saves',
    },
    {
      key: '/log/one-taps',
      label: 'One-Taps',
    },
    {
      key: '/log/transactions',
      label: 'Transactions',
    },
  ];
  return (
    <>
      <Tabs
        centered
        defaultActiveKey={pathname}
        activeKey={pathname}
        items={items}
        onTabClick={(key) => {
          router.push(key);
        }}
      />
    </>
  );
}
