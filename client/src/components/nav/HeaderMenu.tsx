import { UserOutlined } from '@ant-design/icons';
import { Menu, Space, Typography } from 'antd';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const { SubMenu } = Menu;
const { Text } = Typography;

export default function HeaderMenu({ className }: { className: string }) {
  const navigate = useNavigate();
  const location = useLocation();

  const pathname = location.pathname;

  let topPath = pathname;
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
          if (key === '/log') navigate('/log/transactions');
          else navigate(key);
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
          <Menu.Item eventKey='/charts' key='/goals'>
            Charts
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
          <Menu.Item eventKey='/user' key='/user'>
            <UserOutlined />
          </Menu.Item>
        </Space>
      </Menu>
    </>
  );
}
