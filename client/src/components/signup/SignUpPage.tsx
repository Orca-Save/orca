import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { Capacitor } from '@capacitor/core';
import { Button, Space, Typography } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { b2cPolicies, loginRequest } from '../../utils/authConfig';

const { Text } = Typography;

export default function SignUpPage() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  if (isAuthenticated) navigate('/');
  const handleLogin = () => {
    if (Capacitor.getPlatform() !== 'web') {
      instance
        .loginRedirect({
          ...loginRequest,
          authority: b2cPolicies.authorities.signUpSignIn.authority,
        })
        .then((res: any) => {
          console.log('login redirect', res);
          localStorage.setItem('accessToken', res.accessToken);
        })
        .catch((e) => {
          console.log('error', e);
        });
    } else {
      instance
        .loginPopup({
          ...loginRequest,
          authority: b2cPolicies.authorities.signUpSignIn.authority,
        })
        .then((res: any) => {
          console.log('login redirect', res);
          localStorage.setItem('accessToken', res.accessToken);
        })
        .catch((e) => {
          console.log('error', e);
        });
    }
  };
  return (
    <div className='bg-color-black mg-5 flex justify-center items-center h-screen'>
      <Space direction='vertical' size={50}>
        <h1
          style={{
            marginBottom: '80px',
          }}
          className='varela-round text-center text-4xl'
        >
          Orca
        </h1>

        <h1
          className={`font-sans text-center decoration-clone pb-3 text-6xl bg-clip-text text-transparent bg-gradient-to-r from-orca-blue to-orca-pink font-bold`}
        >
          Impulse saving.
        </h1>
        <p className=' text-3xl px-4' style={{ textAlign: 'center' }}>
          Stop buying what you don&apos;t need, so you can save for what you
          really want.
        </p>

        <div className='w-100 flex flex-col space-y-4'>
          <Button
            data-id='sign-up-button'
            type='primary'
            size='large'
            className='w-full'
            onClick={handleLogin}
          >
            Lets go!
          </Button>
        </div>
      </Space>
    </div>
  );
}
