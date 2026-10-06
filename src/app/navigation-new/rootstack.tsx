/**
 * Navigation Root Stack
 *
 * Top-level stack that includes modals + guest/tab navigation
 */
import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useModuleModals } from '~/app/module';

import { hiddenStackScreenOptions, rootStackOptions, visibleStackScreenOptions } from './options';
import { useTabNavigation } from './tabs';

export const useRootStackNavigation = () => {
  const modals = useModuleModals();
  const tabs = useTabNavigation();
  const Navigation = React.useMemo(
    () =>
      createNativeStackNavigator({
        groups: {
          modals: {
            screenOptions: visibleStackScreenOptions,
            screens: modals,
          },
          tabs: {
            screenOptions: hiddenStackScreenOptions,
            screens: { $tabs: tabs },
          },
        },
        initialRouteName: '$tabs',
        screenOptions: rootStackOptions,
      }),
    [modals, tabs],
  );
  return Navigation;
};
