import React from 'react';
import { Skeleton } from 'antd';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { Outlet, useNavigate } from 'react-router-dom';

const ProtectedRoute = () => {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();

  const { accounts } = useMsal();
  const userId = accounts[0]?.localAccountId;
  if (!isAuthenticated) {
    navigate('/sign-in');
  }

  if (!userId) {
    return <Skeleton active />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
