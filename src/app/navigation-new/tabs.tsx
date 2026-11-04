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

import { AllModulesStaticScreens, AnyTabModule, isModuleAvailable, useModuleScreens, useTabModules } from '~/app/module';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { CaptionText } from '~/framework/components/text';
import Feedback from '~/framework/util/feedback/feedback';
import { useSession } from '~/modules/auth/store/accounts';

import { useConfirmChangeTab } from './confirm-remove';
import { tabsOptions } from './options';
import { createTabStackNavigation } from './tab-stack';
import theme from '../theme';

type TabScreenName<Name extends string> = `$tab/${Name}`;

/**
 * Name of the tab screen of a module. Use it to navigate to the tab itself.
 */
export const getTabScreenName = <Name extends AnyTabModule['name']>(name: Name): TabScreenName<Name> => `$tab/${name}`;

function TabLabel({
  color,
  testId,
}: AnyTabModule['tab'] & Parameters<Extract<BottomTabNavigationOptions['tabBarLabel'], Function>>[0]) {
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
}: AnyTabModule['tab'] & Parameters<Extract<BottomTabNavigationOptions['tabBarIcon'], Function>>[0]) {
  // @todo get colors from myApps !
  return <Svg width={tabBarIconSize} height={tabBarIconSize} name={focused ? iconActive : iconInactive} fill={color} />;
}

/**
 * Whether the tab of the module is shown: only if the session can use the module (see `isModuleAvailable`).
 * The tabs are only rendered with a session. Without one (while they are leaving, after a sign-out), they are all kept: hiding them
 * all would leave the tab navigator without any screen, which throws.
 */
const useIsTabAvailable = (module: AnyTabModule) => {
  const session = useSession();
  return session === undefined || isModuleAvailable(module, session);
};

const createTabRoute = (screens: AllModulesStaticScreens, module: AnyTabModule) => {
  const tabConfig = module.tab;
  const useIsAvailable = () => useIsTabAvailable(module);
  return createBottomTabScreen({
    if: useIsAvailable,
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
};

/**
 * Tab screens of all modules that have a tab, indexed by `getTabScreenName(module.name)`.
 */
type AllModulesTabRoutes = {
  [Module in AnyTabModule as TabScreenName<Module['name']>]: ReturnType<typeof createTabRoute>;
};

/**
 * Gather all static tabs from modules.
 * @returns
 */
export const useModuleTabRoutes = (): AllModulesTabRoutes => {
  const tabModules = useTabModules();
  const screens = useModuleScreens();
  // All the tabs are declared: each one is shown only if the session can use its module (`if`), so the navigation stays static.
  return React.useMemo(() => {
    return Object.assign(
      {},
      ...tabModules.map(module => ({
        [getTabScreenName(module.name)]: createTabRoute(screens, module),
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
