import * as React from 'react';

import { NetworkMonitorResult, useNetworkMonitoring } from '~/framework/util/monitoring/network/hook';

const NetworkMonitorContext = React.createContext<NetworkMonitorResult>({
  check: async () => {},
  connected: true,
  loading: true,
  setVisible: () => {},
  visible: false,
});

export function NetworkMonitorProvider({ children }: React.PropsWithChildren) {
  const values = useNetworkMonitoring();
  return <NetworkMonitorContext value={values}>{children}</NetworkMonitorContext>;
}

export const useNetworkStatus = () => React.useContext(NetworkMonitorContext);
