import { Layout, Typography } from 'antd';
import React from 'react';
import HeaderMenu from './HeaderMenu';

const { Content, Footer } = Layout;
const { Title } = Typography;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout className='main-layout'>
      <HeaderMenu className='hidden sm:flex' />
      <div className='sm:hidden'>
        <Title
          className='varela-round text-center'
          level={3}
          style={{
            margin: '12px 32px 0',
          }}
        >
          Orca
        </Title>
      </div>
      <Content
        style={{
          margin: '12px 13px 0',
        }}
      >
        <div className='flex justify-center h-full'>
          <div className='w-full md:w-4/5 lg:w-3/5'>{children}</div>
        </div>
      </Content>
      <div
        className='sm:hidden'
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 100,
          borderTop: '2px solid #f0f0f0',
        }}
      >
        <HeaderMenu className='' />
      </div>
    </Layout>
  );
}
