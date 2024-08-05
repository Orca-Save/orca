import { useIsAuthenticated } from '@azure/msal-react';
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const ProtectedRoute = () => {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/sign-in');
  }

  return <Outlet />;
};

export default ProtectedRoute;
