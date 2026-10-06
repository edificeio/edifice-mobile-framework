/**
 * Root Stack
 *
 * Top-level stack that includes modals + guest/tab navigation
 */
import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useModuleTabNavigation } from './tabs';
import { useModuleModals } from '../module/hooks';

export const useModulesNavigation = () => {
  const modals = useModuleModals();
  const tabs = useModuleTabNavigation();
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
