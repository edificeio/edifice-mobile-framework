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

import { AllModulesStaticScreens, AnyTabModule, isModuleAvailableForUser, useModuleScreens, useTabModules } from '~/app/module';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { CaptionText } from '~/framework/components/text';
import Feedback from '~/framework/util/feedback/feedback';
import { useSession } from '~/modules/auth/store/accounts';
import { type EntAppDisplay, useModuleAppDisplay } from '~/modules/myapps/hooks';
import { I18n } from '~/util/i18n';

import { useConfirmChangeTab } from './confirm-remove';
import { tabsOptions } from './options';
import { createTabStackNavigation } from './tab-stack';

type TabScreenName<Name extends string> = `$tab/${Name}`;

/**
 * Name of the tab screen of a module. Use it to navigate to the tab itself.
 */
export const getTabScreenName = <Name extends AnyTabModule['name']>(name: Name): TabScreenName<Name> => `$tab/${name}`;

/**
 * Label of the tab of a module: an arbitrary rule, kept here. In order:
 * 1. the translation of `tab.labelI18n`, when the module gives one (and the key has a translation);
 * 2. else the label of the app of the module (`useModuleAppDisplay`: `appName` translated by the server, loaded by `myapps`, else the
 *    name of the module, always defined).
 */
export const getTabLabel = (module: { tab?: { labelI18n?: string } }, appDisplay: Pick<EntAppDisplay, 'label'>): string => {
  const key = module.tab?.labelI18n;
  const translated = key ? I18n.get(key) : undefined;
  return translated && translated !== key ? translated : appDisplay.label;
};

/** Label of a tab: the translation of `tab.labelI18n`, else the label of the app of the module, else its name (see `getTabLabel`). */
function TabLabel({
  color,
  module,
}: { module: AnyTabModule } & Parameters<Extract<BottomTabNavigationOptions['tabBarLabel'], Function>>[0]) {
  const label = getTabLabel(module, useModuleAppDisplay(module.name));
  return (
    <CaptionText numberOfLines={1} ellipsizeMode="middle" style={{ color, marginHorizontal: -UI_SIZES.spacing.minor }}>
      {label}
    </CaptionText>
  );
}

export const tabBarIconSize = UI_SIZES.elements.icon.small;

function TabIcon({
  color,
  focused,
  iconActive,
  iconInactive,
}: Readonly<AnyTabModule['tab'] & Parameters<Extract<BottomTabNavigationOptions['tabBarIcon'], Function>>[0]>) {
  return <Svg width={tabBarIconSize} height={tabBarIconSize} name={focused ? iconActive : iconInactive} fill={color} />;
}

/**
 * Whether the tab of the module is shown: only if the session can use the module (see `isModuleAvailableForUser`).
 * The tabs are only rendered with a session. Without one (while they are leaving, after a sign-out), they are all kept: hiding them
 * all would leave the tab navigator without any screen, which throws.
 */
const useIsTabAvailable = (module: AnyTabModule) => {
  const session = useSession();
  return session === undefined || isModuleAvailableForUser(module, session);
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
      tabBarLabel: props => <TabLabel {...props} module={module} />,
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
