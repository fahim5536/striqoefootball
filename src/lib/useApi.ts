import { useState, useEffect } from 'react';
import { api } from './api';

export function useApi<T>(endpoint: string, options: { enabled?: boolean } = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(options.enabled !== false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = async () => {
    if (options.enabled === false) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(endpoint);
      setData(res);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [endpoint, options.enabled]);

  return { data, loading, error, refetch: fetch };
}
