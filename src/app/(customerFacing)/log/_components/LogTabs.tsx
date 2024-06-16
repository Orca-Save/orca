'use client';

import { Tabs, TabsProps } from 'antd';
import { useRouter } from 'next/navigation';

export default function LogTabs({
  items,
  defaultActiveKey,
}: {
  items: TabsProps['items'];
  defaultActiveKey: string;
}) {
  const router = useRouter();
  return (
    <Tabs
      centered
      defaultActiveKey={defaultActiveKey}
      items={items}
      onTabClick={(key) => {
        console.log('key', key);
        router.push('/log/' + key);
      }}
    />
  );
}
