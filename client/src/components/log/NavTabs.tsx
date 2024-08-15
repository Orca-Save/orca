import { Tabs, TabsProps } from 'antd';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function NavTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  const items: TabsProps['items'] = [
    {
      key: '/log/charts',
      label: 'Charts',
    },
    {
      key: '/log/savings',
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
          navigate(key);
        }}
      />
    </>
  );
}
