import { useEffect, useState } from 'react';

// Define the custom hook
const useFetch = (url: string) => {
  // State for storing data
  const [data, setData] = useState(null);
  // State for storing loading status
  const [loading, setLoading] = useState(true);
  // State for storing any errors
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    // Function to fetch data
    const fetchData = async () => {
      try {
        // Start loading
        setLoading(true);
        // Fetch data from the API
        const response = await fetch('http://localhost:3001/' + url);
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
