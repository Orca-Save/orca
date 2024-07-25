import { useEffect, useState } from 'react';

// Define the custom hook
const useFetch = (url: string, method = 'POST', body?: any) => {
  // State for storing data
  const [data, setData] = useState<any>(null);
  // State for storing loading status
  const [loading, setLoading] = useState(true);
  // State for storing any errors
  const [error, setError] = useState<any>(null);
  useEffect(() => {
    const fetchData = async () => {
      console.log('try this');
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('No access token found');
      }

      try {
        // Start loading
        setLoading(true);
        // Fetch data from the API
        const response = await fetch('http://localhost:3001/' + url, {
          method,
          body: JSON.stringify(body),
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('response', response);
        // Check if the response is ok
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // Parse the JSON data
        const data = await response.json();
        // Set the data state
        setData(data);
      } catch (error) {
        // Set the error state
        setError(error);
      } finally {
        // Stop loading
        setLoading(false);
      }
    };

    // Call the fetchData function
    fetchData();
  }, [url]);

  // Return the data, loading, and error states
  return { data, loading, error };
};

export default useFetch;
