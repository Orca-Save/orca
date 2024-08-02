import { useMsal } from '@azure/msal-react';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useRef } from 'react';

import { loginRequest } from '../utils/authConfig';

const REFRESH_THRESHOLD = 300; // 5 minutes in seconds
const TOKEN_CHECK_INTERVAL = 60000; // 1 minute in milliseconds

export const useTokenRefresh = () => {
  const interval = useRef<any>(null);
  const { instance, accounts } = useMsal();
  const acquireTokenWithRefreshToken = async () => {
    try {
      if (accounts.length && instance) {
        const response = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0],
        });
        const decodeToken = jwtDecode(response.accessToken);
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.getItem('accessToken');

        console.log('Token refreshed');
        console.log('Token renewed:', decodeToken);
      }
    } catch (error) {
      console.log('Error refreshing token', error); // Handle token refresh error
    }
  };
  useEffect(() => {
    const checkTokenExpiry = () => {
      const backendAccessToken = localStorage.getItem('accessToken');
      if (backendAccessToken) {
        const decodeToken = jwtDecode(backendAccessToken);
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        if (decodeToken.exp) {
          const timeUntilExpiry = decodeToken.exp - currentTime;
          if (timeUntilExpiry <= REFRESH_THRESHOLD) {
            // Token is about to expire or has expired, refresh it
            acquireTokenWithRefreshToken();
          }
        }
      }
    };
    interval.current = setInterval(checkTokenExpiry, TOKEN_CHECK_INTERVAL);
    checkTokenExpiry(); // Check token expiry immediately after mounting
    return () => clearInterval(interval.current);
  }, []);
  return null; // You might not need to return anything from this hook
};
