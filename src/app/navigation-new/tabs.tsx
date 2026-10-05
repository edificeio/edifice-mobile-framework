import React from 'react';

import { createBottomTabNavigator, createBottomTabScreen } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AllModulesStaticScreens, AnyEntTabModule } from '../module';
import { useModuleScreens } from '../module/hooks';
import { useTabModules } from '../module/loader';

const getTabScreenName = (module: AnyEntTabModule) => `$tab/${module.name}`;

/**
 * Gather all static tabs from modules.
 * @returns
 */
export const useModuleTabs = (): AllModulesStaticScreens => {
  const tabModules = useTabModules();
  const screens = useModuleScreens();
  return React.useMemo(() => {
    return Object.assign(
      {},
      ...tabModules.map(module => ({
        [getTabScreenName(module)]: createBottomTabScreen({
          screen: createNativeStackNavigator({
            initialRouteName: module.tab.route,
            screens,
          }),
        }),
      })),
    );
  }, [screens, tabModules]);
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
