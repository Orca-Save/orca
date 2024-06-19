'use client';

import { varelaRound } from '@/lib/fonts';
import { baseURL } from '@/lib/utils';
import { LoginOutlined, UserOutlined } from '@ant-design/icons';
import { Menu, Space, Tabs, TabsProps, Typography } from 'antd';
import { signIn, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const { SubMenu } = Menu;
const { Text } = Typography;

export default function HeaderMenu({
  className,
  position,
}: {
  className: string;
  position: 'bottom' | 'top';
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [current, setCurrent] = useState(pathname);
  const router = useRouter();
  useEffect(() => {
    setCurrent(pathname);
  }, [pathname]);

  let topPath = current;
  if (topPath.includes('/log')) {
    topPath = '/log';
  }
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
  const onClick = (key: string) => {
    if (key === '/user') {
      if (session) {
        router.push(key);
      } else {
        signIn('azure-ad-b2c', { callbackUrl: baseURL + '/' });
      }
    } else {
      router.push(key);
    }
  };
  return (
    <>
      <Menu
        className={className}
        mode='horizontal'
        selectedKeys={[topPath, current]}
        onSelect={({ key }) => {
          onClick(key);
        }}
      >
        <Space
          style={{ width: '60px', marginLeft: '10px' }}
          align='center'
          size={0}
          className='hidden md:inline'
        >
          <Text className={`${varelaRound.className}`}>Orca</Text>
        </Space>
        <Space
          direction='horizontal'
          size='small'
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <Menu.Item key='/' eventKey='/'>
            Home
          </Menu.Item>
          <Menu.Item eventKey='/goals' key='/goals'>
            Goals
          </Menu.Item>
          <SubMenu key='/log' title='Log' onTitleClick={() => onClick('/log')}>
            <Menu.Item eventKey='/log/saves' key='/log/saves'>
              Impulse Saves
            </Menu.Item>
            <Menu.Item eventKey='/log/one-taps' key='/log/one-taps'>
              One-Taps
            </Menu.Item>
            <Menu.Item eventKey='/log/transactions' key='/log/transactions'>
              Transactions
            </Menu.Item>
          </SubMenu>
          <Menu.Item eventKey='/user' key='/user'>
            {session ? <UserOutlined /> : <LoginOutlined />}
          </Menu.Item>
        </Space>
      </Menu>
      {current.includes('/log') && (
        <Tabs
          centered
          className={position === 'bottom' ? 'hidden' : 'inline'} //hidden md:inline'}
          defaultActiveKey={current}
          activeKey={current}
          items={items}
          onTabClick={(key) => {
            router.push(key);
          }}
        />
      )}
    </>
  );
}
