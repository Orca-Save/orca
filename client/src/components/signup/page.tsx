'use client';
import { varelaRound } from '@/lib/fonts';
import { baseURL } from '@/lib/utils';
import { Button, Layout, Space } from 'antd';
import { signIn } from 'next-auth/react';
import { Open_Sans } from 'next/font/google';
import { Title } from '../_components/Typography';

const openSans = Open_Sans({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-opensans',
});
export default function SignUpPage() {
  const onClick = () => {
    signIn('azure-ad-b2c', { callbackUrl: baseURL });
  };
  return (
    <Layout>
      <div>
        <Title
          className={`${varelaRound.className} text-center`}
          level={3}
          style={{
            margin: '64px 32px 0',
            fontWeight: 'normal',
          }}
        >
          Orca
        </Title>
      </div>
      <div
        className='bg-color-black mg-5 flex justify-center items-center h-screen'
        style={{ margin: 15 }}
      >
        <Space direction='vertical' size={50}>
          <h2
            className={`${openSans.className} text-center decoration-clone pb-3 text-6xl bg-clip-text text-transparent bg-gradient-to-r from-orca-blue to-orca-pink`}
            style={{
              fontWeight: 'bolder',
            }}
          >
            Impulse saving.
          </h2>

          <p className=' text-3xl px-4' style={{ textAlign: 'center' }}>
            Stop buying what you don&apos;t need, so you can save for what you
            really want.
          </p>

          <div className='w-100 flex flex-col space-y-4'>
            <Button
              data-id='signup-button'
              type='primary'
              size='large'
              className='w-full text-2xl align-middle'
              style={{
                height: 80,
              }}
              onClick={onClick}
            >
              {/* <a href="https://orcanext.b2clogin.com/orcanext.onmicrosoft.com/b2c_1_orca_signin/oauth2/v2.0/authorize?client_id=3dd4e88e-63c3-49b3-af56-f2770cf498a8&scope=offline_access%20openid&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fazure-ad-b2c&state=AUwpUvWbqIRYKTlgIQ6LnrYpVQwob6tnGMSXe5RVHSI&option=signup"> */}
              Lets go!
              {/* </a> */}
            </Button>
            {/* <Button size="large" className="w-full " onClick={onClick}>
            Login
          </Button> */}
          </div>
        </Space>
      </div>
    </Layout>
  );
}
