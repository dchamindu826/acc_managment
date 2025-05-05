import { useState, useEffect, useCallback } from 'react';

const useMockApi = (apiCall, params = [], initialData = null) => {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiCall(...params);
      setData(result);
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, JSON.stringify(params)]); // Re-run if apiCall or params change

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Initial fetch

  const refresh = () => {
      fetchData();
  }

  return { data, isLoading, error, setData, refresh };
};

export default useMockApi;