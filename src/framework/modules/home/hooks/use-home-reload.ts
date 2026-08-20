import * as React from 'react';

import { useNavigation } from '@react-navigation/native';

const HomeReloadContext = React.createContext(0);

export const HomeReloadProvider = HomeReloadContext.Provider;

/**
 * Value the home screen provides. It listens to the bottom bar, not to itself: opening a news from
 * the home and coming back leaves the tab focused all along, where switching tab focuses it again.
 * Swiping between the two tabs of the home changes nothing either.
 */
export function useHomeReloadKey() {
  const navigation = useNavigation();
  const [key, setKey] = React.useState<number>(0);

  React.useEffect(() => navigation.getParent()?.addListener('focus', () => setKey(value => value + 1)), [navigation]);

  return key;
}

/**
 * Loads on mount, then every time the home is opened again.
 *
 * Returns whether the load is running, for the screen to show its placeholders. A load outrun by
 * the next one is ignored.
 */
export function useHomeReload(load: () => Promise<unknown>) {
  const key = React.useContext(HomeReloadContext);
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
