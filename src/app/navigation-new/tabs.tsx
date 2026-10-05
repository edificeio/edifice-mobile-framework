import React from 'react';

import { createBottomTabNavigator, createBottomTabScreen } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AllModulesStaticScreens, EntModule } from '../module';
import { useModules } from '../module/loader';

/**
 * Gather all static tabs from modules.
 * @returns
 */
export const useModuleTabs = (): AllModulesStaticScreens => {
  const modules = useModules();
  return React.useMemo(() => {
    const tabModules = modules.filter(module => module instanceof EntModule && module.tab !== undefined);
    return Object.assign(
      {},
      ...tabModules.map(module => ({
        [`$tab/${module.name}`]: createBottomTabScreen({
          screen: createNativeStackNavigator({
            screens: Object.assign({}, ...modules.map(m => m.screens)) as AllModulesStaticScreens,
          }),
        }),
      })),
    );
  }, [modules]);
};

export const useModuleTabNavigation = () => {
  const tabs = useModuleTabs();
  const Navigation = React.useMemo(
    () =>
      createBottomTabNavigator({
        screens: tabs,
      }),
    [tabs],
  );
  return Navigation;
};
