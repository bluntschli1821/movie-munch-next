import { useCallback, useEffect, useState } from "react";

export const useFetch = <T>(
  fetchFunction: () => Promise<T>,
  autoFetch = true
) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchFunction();

      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occured"));
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  useEffect(
    () => {
      if (autoFetch) {
        const timeoutId = window.setTimeout(() => {
          void fetchData();
        }, 0);

        return () => window.clearTimeout(timeoutId);
      }
    }, [autoFetch, fetchData]
  );

  return { data, error, loading, reset, refetch: fetchData };
};
