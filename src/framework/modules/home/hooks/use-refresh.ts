import * as React from 'react';

/** Pull to refresh. Keeps the spinner up until the load ends, even when it fails. */
export function useRefresh(load: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  return { onRefresh, refreshing };
}
