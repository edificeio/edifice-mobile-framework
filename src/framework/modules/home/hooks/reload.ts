import * as React from 'react';

import { useNavigation } from '@react-navigation/native';

interface HomeReloadValue {
  key: number;
  bump: () => void;
}

const HomeReloadContext = React.createContext<HomeReloadValue>({ bump: () => {}, key: 0 });

export const HomeReloadProvider = HomeReloadContext.Provider;

/**
 * Value the home screen provides. It listens to the bottom bar, not to itself: opening a news from
 * the home and coming back leaves the tab focused all along, where switching tab focuses it again.
 * Swiping between the two tabs of the home changes nothing either.
 *
 * `bump` lets a tab ask for the same reload, which is what the pull gesture does.
 */
export function useHomeReloadValue(): HomeReloadValue {
  const navigation = useNavigation();
  const [key, setKey] = React.useState<number>(0);

  const bump = React.useCallback(() => setKey(value => value + 1), []);

  React.useEffect(() => navigation.getParent()?.addListener('focus', bump), [bump, navigation]);

  return React.useMemo(() => ({ bump, key }), [bump, key]);
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
export function useHomeReload(load: () => Promise<unknown>) {
  const { key } = React.useContext(HomeReloadContext);
  const [reloading, setReloading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let outdated = false;
    setReloading(true);
    load().finally(() => {
      if (!outdated) setReloading(false);
    });
    return () => {
      outdated = true;
    };
  }, [key, load]);

  return reloading;
}
