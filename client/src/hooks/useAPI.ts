import { useMsal } from '@azure/msal-react';
import { checkTokenExpiry, refreshMsalAccessToken } from '../utils/general'; // adjust the relative path if needed

const useAPI = () => {
  const { instance, accounts } = useMsal();

  return async (url: string, method = 'POST', body?: any) => {
    if (!checkTokenExpiry()) {
      const account = accounts[0];
      if (!account) {
        throw new Error('No account found');
      }
      await refreshMsalAccessToken(instance, account);
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(process.env.REACT_APP_API_URL + '/' + url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response.json();
  };
};

export default useAPI;
