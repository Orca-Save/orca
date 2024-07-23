import { useMsal } from '@azure/msal-react';
import { Button, Menu, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

const { SubMenu } = Menu;
const { Text } = Typography;

const loginRequest = {
  scopes: ['User.Read'],
};
export default function HeaderMenu({ className }: { className: string }) {
  const { instance } = useMsal();
  const pathname = '';
  const handleLogin = (loginType) => {
    console.log('hello');
    if (loginType === 'popup') {
      instance.loginPopup(loginRequest).catch((e) => {
        console.log(e);
      });
    } else if (loginType === 'redirect') {
      instance.loginRedirect(loginRequest).catch((e) => {
        console.log(e);
      });
    }
  };

  const [current, setCurrent] = useState(pathname);
  useEffect(() => {
    setCurrent(pathname);
  }, [pathname]);

  let topPath = current;
  if (topPath.includes('/log')) {
    topPath = '/log';
  }
  const onClick = (key: string) => {
    if (key === '/user') {
      // if (session) {
      //   // router.push(key);
      // } else {
      //   signIn('azure-ad-b2c', { callbackUrl: baseURL + '/' });
      // }
    } else {
      // router.push(key);
    }
  };
  return (
    <>
      <Menu
        className={className}
        mode='horizontal'
        selectedKeys={[topPath]}
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
          <Text className='varela-round'>Orca</Text>
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
          <Menu.Item eventKey='/log' key='/log'>
            Log
          </Menu.Item>
          {/* <SubMenu key='/log' title='Log' onTitleClick={() => onClick('/log')}>
            <Menu.Item eventKey='/log/saves' key='/log/saves'>
              Impulse Saves
            </Menu.Item>
            <Menu.Item eventKey='/log/one-taps' key='/log/one-taps'>
              One-Taps
            </Menu.Item>
            <Menu.Item eventKey='/log/transactions' key='/log/transactions'>
              Transactions
            </Menu.Item>
          </SubMenu> */}

          <Button type='primary' onClick={() => handleLogin('popup')}>
            Sign in using Popup
          </Button>
          <Button type='primary' onClick={() => handleLogin('redirect')}>
            Sign in using Redirect
          </Button>
          <Menu.Item eventKey='/user' key='/user'>
            {/* {session ? <UserOutlined /> : <LoginOutlined />} */}
          </Menu.Item>
        </Space>
      </Menu>
    </>
  );
}
