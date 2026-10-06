/**
 * Navigation Root Stack
 *
 * Top-level stack that includes modals + guest/tab navigation
 */
import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useModuleModals } from '~/app/module';

import { useTabNavigation } from './tabs';

export const useRootStackNavigation = () => {
  const modals = useModuleModals();
  const tabs = useTabNavigation();
  const Navigation = React.useMemo(
    () =>
      createNativeStackNavigator({
        initialRouteName: '$tabs',
        screens: { $tabs: tabs, ...modals },
      }),
    [modals, tabs],
  );
  return Navigation;
};
