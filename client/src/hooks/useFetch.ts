import { useEffect, useState } from 'react';

const useFetch = (url: string, method = 'POST', body?: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  useEffect(() => {
    const fetchData = async () => {
      console.log('fetching data', process.env.REACT_APP_API_URL + '/' + url);
      const token = localStorage.getItem('accessToken');
      console.log('token', token);

      if (!token) {
        setError('No token found');
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
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('done data', process.env.REACT_APP_API_URL + '/' + url);
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
  }, [url]);

  return { data, loading, error };
};

export default useFetch;
