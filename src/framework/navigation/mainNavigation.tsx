/**
 * The MainNavigation is nav hierarchy used when the user is logged in.
 * It includes all modules screens and TabBar screens.
 *
 * navBar shows up with the RootSTack's NativeStackNavigator, not TabNavigator (because TabNavigator is not native).
 */
import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationHelpers, ParamListBase, StackActions } from '@react-navigation/native';
import I18n from 'i18n-js';
import * as React from 'react';
import { Platform } from 'react-native';

import { setUpModulesAccess } from '~/app/modules';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture, PictureProps } from '~/framework/components/picture';
import { TextSizeStyle } from '~/framework/components/text';
import AuthNavigator from '~/framework/modules/auth/navigation/navigator';
import { navBarOptions } from '~/framework/navigation/navBar';
import { AnyNavigableModuleConfig, IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { ModuleScreens } from './moduleScreens';
import { getTypedRootStack } from './navigators';
import { computeTabRouteName, tabModules } from './tabModules';

//  88888888888       888      888b    888                   d8b                   888
//      888           888      8888b   888                   Y8P                   888
//      888           888      88888b  888                                         888
//      888   8888b.  88888b.  888Y88b 888  8888b.  888  888 888  .d88b.   8888b.  888888  .d88b.  888d888
//      888      "88b 888 "88b 888 Y88b888     "88b 888  888 888 d88P"88b     "88b 888    d88""88b 888P"
//      888  .d888888 888  888 888  Y88888 .d888888 Y88  88P 888 888  888 .d888888 888    888  888 888
//      888  888  888 888 d88P 888   Y8888 888  888  Y8bd8P  888 Y88b 888 888  888 Y88b.  Y88..88P 888
//      888  "Y888888 88888P"  888    Y888 "Y888888   Y88P   888  "Y88888 "Y888888  "Y888  "Y88P"  888
//                                                                    888
//                                                               Y8b d88P
//                                                                "Y88P"

const Tab = createBottomTabNavigator();

const createTabIcon = (
  moduleConfig: AnyNavigableModuleConfig,
  props: Parameters<Required<BottomTabNavigationOptions>['tabBarIcon']>[0],
) => {
  let dp: Partial<PictureProps> = { ...moduleConfig.displayPicture };
  props.size = UI_SIZES.elements.tabBarIconSize;

  if (dp.type === 'Image') {
    dp.style = [dp.style, { width: props.size, height: props.size }];
  } else if (dp.type === 'Icon') {
    dp.size = dp.size ?? props.size;
    dp.color = dp.color ?? props.color;
    dp.name = dp.name ?? 'more_vert';
  } else if (dp.type === 'NamedSvg') {
    dp.name = dp.name ?? 'ui-options';
    dp.height = props.size;
    dp.width = props.size;
    dp.fill = props.color;
  }

  if (props.focused) {
    dp = { ...dp, ...moduleConfig.displayPictureFocus } as Partial<PictureProps>;
  }

  return <Picture {...(dp as PictureProps)} />;
};

const createTabOptions = (moduleConfig: AnyNavigableModuleConfig) => {
  return {
    tabBarLabel: I18n.t(moduleConfig.displayI18n),
    tabBarIcon: props => {
      return createTabIcon(moduleConfig, props);
    },
  } as BottomTabNavigationOptions;
};

/**
 * Resets tabs with stackNavigators to the first route when navigation to another tab
 */
const resetTabStacksOnBlur = ({ navigation }: { navigation: NavigationHelpers<ParamListBase> }) => ({
  blur: () => {
    const state = navigation.getState();
    state.routes.forEach((route, tabIndex) => {
      if (state?.index !== tabIndex && route.state?.index !== undefined && route.state?.index > 0) {
        navigation.dispatch(StackActions.popToTop());
      }
    });
  },
});

export function TabNavigator({ apps, widgets }: { apps?: IEntcoreApp[]; widgets?: IEntcoreWidget[] }) {
  const RootStack = getTypedRootStack();
  const tabRoutes = React.useMemo(() => {
    const modules = tabModules.get().filterAvailables(apps ?? []);
    return modules
      .sort((a, b) => a.config.displayOrder - b.config.displayOrder)
      .map(module => {
        const TabStack = () => (
          <RootStack.Navigator screenOptions={navBarOptions} initialRouteName={module.config.routeName}>
            {ModuleScreens.all}
            {AuthNavigator()}
          </RootStack.Navigator>
        );
        return (
          <Tab.Screen
            key={module.config.routeName}
            name={computeTabRouteName(module.config.routeName)}
            options={createTabOptions(module.config)}
            listeners={resetTabStacksOnBlur}>
            {TabStack}
          </Tab.Screen>
        );
      });
  }, [apps]);
  const screenOptions: BottomTabNavigationOptions = React.useMemo(
    () => ({
      lazy: false, // Prevent navBar flickering with this option
      freezeOnBlur: true,
      headerShown: false,
      tabBarStyle: {
        backgroundColor: theme.ui.background.card,
        borderTopColor: theme.palette.grey.cloudy,
        borderTopWidth: 1,
        elevation: 1,
        height: UI_SIZES.elements.tabbarHeight + Platform.select({ ios: UI_SIZES.screen.bottomInset, default: 0 }),
      },
      tabBarLabelStyle: { fontSize: TextSizeStyle.Small.fontSize, marginBottom: UI_SIZES.elements.tabBarLabelMargin },
      tabBarIconStyle: { marginTop: UI_SIZES.elements.tabBarLabelMargin },
      tabBarActiveTintColor: theme.palette.primary.regular.toString(), // 😡 F U React Nav 6, using plain string instead of ColorValue
      tabBarInactiveTintColor: theme.ui.text.light.toString(), // 😡 F U React Nav 6, using plain string instead of ColorValue
    }),
    [],
  );
  return <Tab.Navigator screenOptions={screenOptions}>{tabRoutes}</Tab.Navigator>;
}

//   .d8888b.  888                      888      888b    888                   d8b                   888
//  d88P  Y88b 888                      888      8888b   888                   Y8P                   888
//  Y88b.      888                      888      88888b  888                                         888
//   "Y888b.   888888  8888b.   .d8888b 888  888 888Y88b 888  8888b.  888  888 888  .d88b.   8888b.  888888  .d88b.  888d888
//      "Y88b. 888        "88b d88P"    888 .88P 888 Y88b888     "88b 888  888 888 d88P"88b     "88b 888    d88""88b 888P"
//        "888 888    .d888888 888      888888K  888  Y88888 .d888888 Y88  88P 888 888  888 .d888888 888    888  888 888
//  Y88b  d88P Y88b.  888  888 Y88b.    888 "88b 888   Y8888 888  888  Y8bd8P  888 Y88b 888 888  888 Y88b.  Y88..88P 888
//   "Y8888P"   "Y888 "Y888888  "Y8888P 888  888 888    Y888 "Y888888   Y88P   888  "Y88888 "Y888888  "Y888  "Y88P"  888
//                                                                                      888
//                                                                                 Y8b d88P
//                                                                                  "Y88P"

export enum MainRouteNames {
  Tabs = '$tabs',
}

/**
 * Computes the main navigation screens as a Group.
 * This operation is heavy so be careful to not call it unless content of aaps or widgets really changes.
 * @param apps available apps for the user
 * @param widgets available widgets for the user
 * @returns
 */
export function MainNavigation(apps?: IEntcoreApp[], widgets?: IEntcoreWidget[]) {
  const RootStack = getTypedRootStack();
  setUpModulesAccess(apps ?? [], widgets ?? []);

  const Tabs = () => <TabNavigator apps={apps} widgets={widgets} />;
  return (
    <RootStack.Group screenOptions={navBarOptions}>
      <RootStack.Screen name={MainRouteNames.Tabs} component={Tabs} options={{ headerShown: false }} />
    </RootStack.Group>
  );
}
