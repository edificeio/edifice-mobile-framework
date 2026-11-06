import * as React from 'react';

import { useNavigation } from '@react-navigation/native';

interface HomeReloadValue {
  key: number;
  isTriggeredByPullToRefresh: boolean;
  bump: () => void;
}

export interface HomeReloadOptions {
  isTriggeredByPullToRefresh: boolean;
}

const HomeReloadContext = React.createContext<HomeReloadValue>({ bump: () => {}, isTriggeredByPullToRefresh: false, key: 0 });

export const HomeReloadProvider = HomeReloadContext.Provider;

/**
 * Value the home screen provides. It listens to the bottom bar, not to itself: opening a news from
 * the home and coming back leaves the tab focused all along, where switching tab focuses it again.
 * Swiping between the two tabs of the home changes nothing either.
 *
 * `bump` lets a tab ask for the same reload, which is what the pull gesture does. Then each load
 * receives `isTriggeredByPullToRefresh: true`, and `false` when the home is opened again.
 */
export function useHomeReloadValue(): HomeReloadValue {
  const navigation = useNavigation();
  const [reload, setReload] = React.useState<Omit<HomeReloadValue, 'bump'>>({ isTriggeredByPullToRefresh: false, key: 0 });

  const bump = React.useCallback(() => setReload(value => ({ isTriggeredByPullToRefresh: true, key: value.key + 1 })), []);
  const reloadOnFocus = React.useCallback(
    () => setReload(value => ({ isTriggeredByPullToRefresh: false, key: value.key + 1 })),
    [],
  );

  React.useEffect(() => {
    const parent = navigation.getParent();
    if (!parent) return;
    let blurred = false;
    const unsubscribeBlur = parent.addListener('blur', () => {
      blurred = true;
    });
    const unsubscribeFocus = parent.addListener('focus', () => {
      if (blurred) reloadOnFocus();
      blurred = false;
    });
    return () => {
      unsubscribeBlur();
      unsubscribeFocus();
    };
  }, [navigation, reloadOnFocus]);

  return React.useMemo(() => ({ bump, ...reload }), [bump, reload]);
}

// asks every section to reload, without waiting for any of them.
export function useHomeReloadKeyBump() {
  return React.useContext(HomeReloadContext).bump;
}

/**
 * Loads on mount, then every time the home is opened again or pulled down.
 *
 * Returns whether the load is running, for the caller to show its placeholders. A load outrun by
 * the next one is ignored.
 */
export function useHomeReload(load: (options: HomeReloadOptions) => Promise<unknown>) {
  const { isTriggeredByPullToRefresh, key } = React.useContext(HomeReloadContext);
  const [reloading, setReloading] = React.useState<boolean>(true);
  const loadedKey = React.useRef<number>(key);

  React.useEffect(() => {
    const isLoadStartedByPullToRefresh = isTriggeredByPullToRefresh && loadedKey.current !== key;
    loadedKey.current = key;
    let outdated = false;
    setReloading(true);
    // each section shows its own error, the reload only waits for the load to end.
    load({ isTriggeredByPullToRefresh: isLoadStartedByPullToRefresh })
      .finally(() => {
        if (!outdated) setReloading(false);
      })
      .catch(() => undefined);
    return () => {
      outdated = true;
    };
  }, [isTriggeredByPullToRefresh, key, load]);

  return reloading;
}
