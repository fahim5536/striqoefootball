import React, { createContext, useContext, ReactNode } from 'react';
import { useClientConfig, ClientConfig } from '../hooks/useClientConfig';

const ClientConfigContext = createContext<{ config: ClientConfig | null; loading: boolean }>({
  config: null,
  loading: true
});

export const ClientConfigProvider = ({ children }: { children: ReactNode }) => {
  const { config, loading } = useClientConfig();

  return (
    <ClientConfigContext.Provider value={{ config, loading }}>
      {children}
    </ClientConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ClientConfigContext);
export const useFeatureFlag = (key: string) => {
  const { config } = useConfig();
  return config?.featureFlags?.[key] ?? false;
};
export const useRemoteConfig = (key: string, defaultValue?: any) => {
  const { config } = useConfig();
  return config?.remoteConfig?.[key] ?? defaultValue;
};
