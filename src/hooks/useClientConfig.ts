import { useState, useEffect } from 'react';

export interface ClientConfig {
  featureFlags: Record<string, boolean>;
  remoteConfig: Record<string, any>;
  experiments: Record<string, any>;
}

export function useClientConfig() {
  const [config, setConfig] = useState<ClientConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('striqo_token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('/api/client-config', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setConfig(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { config, loading };
}
