import { varelaRound } from '@/lib/fonts';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { Layout } from 'antd';
import { getServerSession } from 'next-auth';
import { Content, Footer } from '../_components/Layout';
import SignIn from '../_components/SignIn';
import { Title } from '../_components/Typography';
import HeaderMenu from './_components/HeaderMenu';

export const dynamic = 'force-dynamic';

export default async function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  if (!session) return <SignIn />;
  if (!isExtendedSession(session)) <SignIn />;
  return (
    <Layout style={{ minHeight: '100vh', height: '100%' }}>
      <HeaderMenu className='hidden sm:flex' />
      <div className='sm:hidden'>
        <Title
          className={`${varelaRound.className} text-center`}
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
      <Footer
        className='sm:hidden'
        style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 100,
          borderTop: '2px solid #f0f0f0',
        }}
      >
        <HeaderMenu className='' />
      </Footer>
    </Layout>
  );
}