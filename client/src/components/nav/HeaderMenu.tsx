import { useMsal } from '@azure/msal-react';
import { Button, Menu, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { b2cPolicies, loginRequest } from '../../utils/authConfig';

const { SubMenu } = Menu;
const { Text } = Typography;

export default function HeaderMenu({ className }: { className: string }) {
  const { instance } = useMsal();
  const navigate = useNavigate();
  const pathname = '';
  const handleLogout = () => {
    instance.logoutPopup();
  };
  const handleLogin = () => {
    instance
      .loginRedirect({
        ...loginRequest,
        authority: b2cPolicies.authorities.signUpSignIn.authority,
      })
      .then((res: any) => {
        localStorage.setItem('accessToken', res.accessToken);
      })
      .catch((e) => {
        console.log('error', e);
      });
  };

  const [current, setCurrent] = useState(pathname);
  useEffect(() => {
    setCurrent(pathname);
  }, [pathname]);

  let topPath = current;
  if (topPath.includes('/log')) {
    topPath = '/log';
  }
  return (
    <>
      <Menu
        className={className}
        mode='horizontal'
        selectedKeys={[topPath]}
        onSelect={({ key }) => {
          navigate(key);
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
          <Menu.Item eventKey='/log/savings' key='/log'>
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

          <Button type='primary' onClick={() => handleLogin()}>
            Sign in using Redirect
          </Button>
          <Button type='primary' onClick={() => handleLogout()}>
            logout
          </Button>
          <Menu.Item eventKey='/user' key='/user'>
            {/* {session ? <UserOutlined /> : <LoginOutlined />} */}
          </Menu.Item>
        </Space>
      </Menu>
    </>
  );
}
