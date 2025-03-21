import { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';

import { checkTokenExpiry, refreshMsalAccessToken } from '../utils/general';

const useFetch = (url: string, method = 'POST', body?: any) => {
  const { instance, accounts } = useMsal();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!checkTokenExpiry()) {
        const account = accounts[0];
        if (!account) {
          setError('No account found');
          setLoading(false);
          return;
        }
        try {
          await refreshMsalAccessToken(instance, account);
        } catch (error) {
          setError('Failed to refresh token');
          setLoading(false);
          return;
        }
      }
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No token found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          process.env.REACT_APP_API_URL + '/' + url,
          {
            method,
            body: body ? JSON.stringify(body) : undefined,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setData(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, instance, accounts]);

  return { data, loading, error };
};

export default useFetch;
