/**
 * Navigation Tabs
 *
 * Tabs that are displayed when user is logged in.
 * TabNavigator is a direct child of the Root Stack, like modals.
 */
import React from 'react';

import {
  BottomTabNavigationOptions,
  BottomTabNavigatorProps,
  createBottomTabNavigator,
  createBottomTabScreen,
} from '@react-navigation/bottom-tabs';

import { AllModulesStaticScreens, AnyEntTabModule, useModuleScreens, useTabModules } from '~/app/module';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { CaptionText } from '~/framework/components/text';
import Feedback from '~/framework/util/feedback/feedback';

import { useConfirmChangeTab } from './confirm-remove';
import { tabsOptions } from './options';
import { createTabStackNavigation } from './tab-stack';
import theme from '../theme';

type TabScreenName<Name extends string> = `$tab/${Name}`;

/**
 * Name of the tab screen of a module. Use it to navigate to the tab itself.
 */
export const getTabScreenName = <Name extends AnyEntTabModule['name']>(name: Name): TabScreenName<Name> => `$tab/${name}`;

function TabLabel({
  color,
  testId,
}: AnyEntTabModule['tab'] & Parameters<Extract<BottomTabNavigationOptions['tabBarLabel'], Function>>[0]) {
  // @todo get names from myApps innstead of write testId !
  return (
    <CaptionText numberOfLines={1} ellipsizeMode="middle" style={{ color, marginHorizontal: -UI_SIZES.spacing.minor }}>
      {testId}
    </CaptionText>
  );
}

export const tabBarIconSize = UI_SIZES.elements.icon.small;

function TabIcon({
  color,
  focused,
  iconActive,
  iconInactive,
}: AnyEntTabModule['tab'] & Parameters<Extract<BottomTabNavigationOptions['tabBarIcon'], Function>>[0]) {
  // @todo get colors from myApps !
  return <Svg width={tabBarIconSize} height={tabBarIconSize} name={focused ? iconActive : iconInactive} fill={color} />;
}

const createTabRoute = (screens: AllModulesStaticScreens, tabConfig: AnyEntTabModule['tab']) =>
  createBottomTabScreen({
    options: {
      tabBarActiveTintColor: theme.palette.primary.regular!.toString(),
      tabBarButtonTestID: tabConfig.testId,
      tabBarIcon: props => <TabIcon {...props} {...tabConfig} />,
      tabBarIconStyle: {
        height: tabBarIconSize,
        width: tabBarIconSize,
      },
      tabBarInactiveTintColor: theme.ui.text.light!.toString(),
      tabBarLabel: props => <TabLabel {...props} {...tabConfig} />,
    },
    screen: createTabStackNavigation(screens, tabConfig.route),
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
        [getTabScreenName(module.name)]: createTabRoute(screens, module.tab),
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
