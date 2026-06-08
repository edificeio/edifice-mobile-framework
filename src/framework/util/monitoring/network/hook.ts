import * as React from 'react';

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

const CONNECTION_TRACKER_SHOW_DURATION_MS = 2000;

export interface NetworkMonitorResult {
  connected: boolean;
  loading: boolean;
  visible: boolean;
  check: () => Promise<void>;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useNetworkMonitoring = (): NetworkMonitorResult => {
  const [connected, setConnected] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [visible, setVisible] = React.useState<boolean>(false);

  const updateConnected = (state: NetInfoState) => setConnected(state.isInternetReachable || false);

  const check = React.useCallback(async () => {
    setLoading(true);
    const state = await NetInfo.fetch();
    updateConnected(state);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    console.debug('[NetInfo] subscribing');
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      console.debug('[NetInfo] event fired', state);
      updateConnected(state);
      setLoading(false);
      setVisible(true);
    });

    //return () => unsubscribe();
    return () => {
      console.debug('[NetInfo] unsubscribing');
      unsubscribe();
    };
  }, []);

  // Auto-hide
  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setVisible(false), CONNECTION_TRACKER_SHOW_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [connected, visible, loading]);

  return {
    check,
    connected,
    loading,
    setVisible,
    visible,
  };
};
