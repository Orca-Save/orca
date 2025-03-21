import { useMsal } from '@azure/msal-react';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useRef } from 'react';
import { loginRequest } from '../utils/authConfig';
import { refreshMsalAccessToken } from '../utils/general';

const REFRESH_THRESHOLD = 300; // 5 minutes in seconds
const TOKEN_CHECK_INTERVAL = 60000; // 1 minute in milliseconds

export const useTokenRefresh = () => {
  const interval = useRef<any>(null);
  const { instance } = useMsal();

  const checkTokenExpiry = () => {
    const backendAccessToken = localStorage.getItem('accessToken');
    if (backendAccessToken) {
      const decodeToken: any = jwtDecode(backendAccessToken);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodeToken.exp) {
        const timeUntilExpiry = decodeToken.exp - currentTime;
        if (timeUntilExpiry <= REFRESH_THRESHOLD) {
          refreshToken();
        }
      }
    }
  };

  const refreshToken = async () => {
    const account = instance.getAllAccounts()[0];
    if (!account) return;
    try {
      await refreshMsalAccessToken(instance, account);
    } catch (error) {
      instance.logout();
      console.log('Error refreshing token', error);
    }
  };

  useEffect(() => {
    interval.current = setInterval(checkTokenExpiry, TOKEN_CHECK_INTERVAL);
    checkTokenExpiry(); // Check expiry immediately on mount
    return () => clearInterval(interval.current);
  }, [instance]);

  return null;
};
