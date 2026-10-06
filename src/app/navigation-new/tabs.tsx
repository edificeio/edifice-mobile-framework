/**
 * Navigation Tabs
 *
 * Tabs that are displayed when user is logged in.
 * TabNavigator is a direct child of the Root Stack, like modals.
 */
import React from 'react';

import { createBottomTabNavigator, createBottomTabScreen } from '@react-navigation/bottom-tabs';

import { AllModulesStaticScreens, AnyEntTabModule } from '../module';
import { createTabStackNavigation } from './tabStack';
import { useModuleScreens } from '../module/hooks';
import { useTabModules } from '../module/loader';

const getTabScreenName = (module: AnyEntTabModule) => `$tab/${module.name}`;

/**
 * Gather all static tabs from modules.
 * @returns
 */
export const useModuleTabRoutes = (): AllModulesStaticScreens => {
  const tabModules = useTabModules();
  const screens = useModuleScreens();
  return React.useMemo(() => {
    return Object.assign(
      {},
      ...tabModules.map(module => ({
        [getTabScreenName(module)]: createBottomTabScreen({
          screen: createTabStackNavigation(screens, module.tab.route),
        }),
      })),
    );
  }, [screens, tabModules]);
};

export const useTabNavigation = () => {
  const tabs = useModuleTabRoutes();
  const Navigation = React.useMemo(
    () =>
      createBottomTabNavigator({
        screens: tabs,
      }),
    [tabs],
  );
  return Navigation;
};
