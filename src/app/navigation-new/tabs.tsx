/**
 * Navigation Tabs
 *
 * Tabs that are displayed when user is logged in.
 * TabNavigator is a direct child of the Root Stack, like modals.
 */
import React from 'react';

import { BottomTabNavigatorProps, createBottomTabNavigator, createBottomTabScreen } from '@react-navigation/bottom-tabs';

import { AllModulesStaticScreens, AnyEntTabModule, useModuleScreens, useTabModules } from '~/app/module';
import Feedback from '~/framework/util/feedback/feedback';

import { useConfirmChangeTab } from './confirm-remove';
import { tabsOptions } from './options';
import { createTabStackNavigation } from './tabStack';

type TabScreenName<Name extends string> = `$tab/${Name}`;

/**
 * Name of the tab screen of a module. Use it to navigate to the tab itself.
 */
const getTabScreenName = <Name extends AnyEntTabModule['name']>(module: { name: Name }): TabScreenName<Name> =>
  `$tab/${module.name}`;

const createTabRoute = (screens: AllModulesStaticScreens, initialRouteName: Parameters<typeof createTabStackNavigation>[1]) =>
  createBottomTabScreen({
    screen: createTabStackNavigation(screens, initialRouteName),
  });

/**
 * Tab screens of all modules that have a tab, indexed by `getTabScreenName(module.name)`.
 */
type AllModulesTabRoutes = {
  [Module in AnyEntTabModule as TabScreenName<Module['name']>]: ReturnType<typeof createTabRoute>;
};

/**
 * Gather all static tabs from modules.
 * @returns
 */
export const useModuleTabRoutes = (): AllModulesTabRoutes => {
  const tabModules = useTabModules();
  const screens = useModuleScreens();
  return React.useMemo(() => {
    return Object.assign(
      {},
      ...tabModules.map(module => ({
        [getTabScreenName(module)]: createTabRoute(screens, module.tab.route),
      })),
    );
  }, [screens, tabModules]);
};

export const useTabNavigation = () => {
  const tabs = useModuleTabRoutes();
  const confirmChangeTabListeners = useConfirmChangeTab();
  const tabListeners = React.useCallback<NonNullable<BottomTabNavigatorProps['screenListeners'] & Function>>(
    props => ({
      ...confirmChangeTabListeners(props),
      tabPress: event => {
        Feedback.tabPressed();
        confirmChangeTabListeners(props).tabPress?.(event);
      },
    }),
    [confirmChangeTabListeners],
  );
  const Navigation = React.useMemo(
    () =>
      createBottomTabNavigator({
        screenListeners: tabListeners,
        screenOptions: tabsOptions,
        screens: tabs,
      }),
    [tabListeners, tabs],
  );
  return Navigation;
};
