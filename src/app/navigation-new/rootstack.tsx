/**
 * Navigation Root Stack
 *
 * Top-level stack that includes modals + guest/tab navigation
 */
import React from 'react';

import { createNativeStackNavigator, NativeStackNavigatorProps } from '@react-navigation/native-stack';

import { useCoreModuleModals, useCoreModuleScreens, useModuleModals } from '~/app/module';

import { hiddenStackScreenOptions, rootStackOptions, visibleStackScreenOptions } from './options';
import { useSignInStore } from './store';
import { useTabNavigation } from './tabs';

type RootStackGroups = Record<
  string,
  {
    if?: () => boolean;
    screenOptions?: NativeStackNavigatorProps['screenOptions'];
    screens: object;
  }
>;

const useIsSignedIn = () => useSignInStore(s => !!s.session);
const useIsSignedOut = () => useSignInStore(s => !s.session);

const GUEST_START_SCREEN: keyof ReturnType<typeof useCoreModuleScreens> = 'auth/load-account';

export const useRootStackNavigation = () => {
  const guestModals = useCoreModuleModals();
  const userModals = useModuleModals();
  const tabs = useTabNavigation();

  // Start screen must be the first one in the object.
  // Destructuring here to restructure just after to make sure GUEST_START_SCREEN is a first place.
  const { [GUEST_START_SCREEN]: startScreen, ...restGuestScreens } = useCoreModuleScreens();
  const guestScreens = React.useMemo(() => ({ startScreen, ...restGuestScreens }), [restGuestScreens, startScreen]);

  const groups = React.useMemo(
    () =>
      ({
        GuestModals: {
          if: useIsSignedOut,
          screenOptions: visibleStackScreenOptions,
          screens: guestModals,
        },
        GuestScreens: {
          if: useIsSignedOut,
          screenOptions: { animationTypeForReplace: 'pop' },
          screens: guestScreens,
        },
        UserModals: {
          if: useIsSignedIn,
          screenOptions: visibleStackScreenOptions,
          screens: userModals,
        },
        UserScreens: {
          if: useIsSignedIn,
          screenOptions: { ...hiddenStackScreenOptions, animation: 'simple_push' },
          screens: { $tabs: tabs },
        },
      }) satisfies RootStackGroups,
    [guestModals, guestScreens, tabs, userModals],
  );

  // Order of groups does matter, even if they're declared as object !
  // `GuestScreens` need to be first, and with the starting screen a first place too
  const groupsOrder: (keyof typeof groups)[] = React.useMemo(
    () => ['GuestScreens', 'UserScreens', 'GuestModals', 'UserModals'],
    [],
  );

  const Navigation = React.useMemo(
    () =>
      createNativeStackNavigator({
        groups: Object.fromEntries(groupsOrder.map(k => [k, groups[k]])),
        screenOptions: rootStackOptions,
      }),
    [groups, groupsOrder],
  );
  return Navigation;
};
