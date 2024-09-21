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
        <p className='text-3xl px-4' style={{ textAlign: 'center' }}>
          Transform impulse spending into impulse saving by setting aside money
          from unnecessary purchases for meaningful goals with just a tap.
        </p>
        <p className='text-3xl px-4' style={{ textAlign: 'center' }}>
          Join the pod saving $35 a week.
        </p>

        <div className='w-100 flex flex-col space-y-4 px-12'>
          <Button
            data-id='sign-up-button'
            type='primary'
            size='large'
            className='w-full'
            onClick={handleLogin}
          >
            Lets do this.
          </Button>
        </div>
      </Space>
    </div>
  );
}
