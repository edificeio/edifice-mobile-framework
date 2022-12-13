/**
 * The MainNavigator is nav hierarchy used when the user is logged in.
 * It includes all modules screens and TabBar screens.
 *
 * navBar shows up with NativeStackNavigator, not TabNavigator (because TabNavigator is not native).
 * So we ensure that every tab renders a NativeStackNavigator, even if it contains a single screen.
 */
import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ParamListBase, StackNavigationState } from '@react-navigation/native';
import {
  NativeStackNavigationEventMap,
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import { NativeStackNavigatorProps } from '@react-navigation/native-stack/lib/typescript/src/types';
import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, Text } from 'react-native';
import { connect } from 'react-redux';

import { setUpModulesAccess } from '~/app/modules';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { navBarOptions } from '~/framework/navigation/navBar';

import { UI_SIZES } from '../components/constants';
import { Picture, PictureProps } from '../components/picture';
import { TextSizeStyle } from '../components/text';
import { getState as getAuthState } from '../modules/auth/reducer';
import { AnyNavigableModuleConfig, IEntcoreApp, IEntcoreWidget } from '../util/moduleTool';
import { ModuleScreens } from './moduleScreens';
import { tabModules } from './tabModules';

interface MainNavigatorProps {
  apps: IEntcoreApp[] | undefined;
  widgets: IEntcoreWidget[] | undefined;
}

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

function TabNavigatorUnconnected({ apps, widgets }: MainNavigatorProps) {
  const routes = React.useMemo(() => {
    const modules = tabModules.get().filterAvailables(apps ?? []);
    return modules
      .sort((a, b) => a.config.displayOrder - b.config.displayOrder)
      .map(module => (
        <Tab.Screen
          key={module.config.routeName}
          name={`${module.config.routeName}.$tab`}
          component={module.root}
          options={createTabOptions(module.config)}
        />
      ));
  }, [apps]);

  return (
    <Tab.Navigator
      screenOptions={{
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
      }}>
      {routes}
    </Tab.Navigator>
  );
}

const TabNavigator = connect((state: IGlobalState) => {
  const authState = getAuthState(state);
  return {
    apps: authState.session?.apps,
    widgets: authState.session?.widgets,
  };
})(TabNavigatorUnconnected);

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

const MainStack = createNativeStackNavigator();

export enum MainRouteNames {
  Tabs = '$tabs',
}

function StackNavigatorUnconnected({ apps, widgets }: MainNavigatorProps) {
  const ret = React.useMemo(
    () => {
      console.log('setUpModulesAccess');
      setUpModulesAccess(apps ?? [], widgets ?? []);
      return (
        <MainStack.Navigator screenOptions={navBarOptions}>
          <MainStack.Screen name={MainRouteNames.Tabs} component={TabNavigator} options={{ headerShown: false }} />
          <MainStack.Group>{ModuleScreens.all}</MainStack.Group>
        </MainStack.Navigator>
      );
    },
    // We WANT to recompute this when apps changes, even if nos directly used in this code
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apps],
  );
  return ret;
}

const StackNavigator = connect((state: IGlobalState) => {
  const authState = getAuthState(state);
  return {
    apps: authState.session?.apps,
    widgets: authState.session?.widgets,
  };
})(StackNavigatorUnconnected);

export default StackNavigator;

//  888b     d888               888          888          888b    888                   d8b                   888
//  8888b   d8888               888          888          8888b   888                   Y8P                   888
//  88888b.d88888               888          888          88888b  888                                         888
//  888Y88888P888  .d88b.   .d88888 888  888 888  .d88b.  888Y88b 888  8888b.  888  888 888  .d88b.   8888b.  888888  .d88b.  888d888
//  888 Y888P 888 d88""88b d88" 888 888  888 888 d8P  Y8b 888 Y88b888     "88b 888  888 888 d88P"88b     "88b 888    d88""88b 888P"
//  888  Y8P  888 888  888 888  888 888  888 888 88888888 888  Y88888 .d888888 Y88  88P 888 888  888 .d888888 888    888  888 888
//  888   "   888 Y88..88P Y88b 888 Y88b 888 888 Y8b.     888   Y8888 888  888  Y8bd8P  888 Y88b 888 888  888 Y88b.  Y88..88P 888
//  888       888  "Y88P"   "Y88888  "Y88888 888  "Y8888  888    Y888 "Y888888   Y88P   888  "Y88888 "Y888888  "Y888  "Y88P"  888
//                                                                                               888
//                                                                                          Y8b d88P
//                                                                                           "Y88P"

/**
 * Registered given routes to the main navigator & return a NativeStackNavigator for the home component fo the module.
 *
 * There is a distinction between "homeScreens" and "stackScreens" :
 *
 * - "homeScreens" is the main component of the module, this first screen to be displayed if the user navigates to it.
 *   This is also the screen that has the TabBar at the bottom.
 *   It is possible to have multiple screens in this. The first will be used as the homepage of the module, and the rest will be accessible within the navigator that links to the module.
 *   (Ex: BottomTabNavigator showing the tabs at the bottom / DrawerNavigator / whatever)
 *
 * - "stackScreens" must contain the other screens of the module, and will be included to the main NativeStack.
 *   They will be accessible from anywhere, anymodule, independantly of the navigator that links to the homeScreens.
 *
 * Both homeScreens and stackScreens are included in a StackNavigator that is given as a parameter
 *
 * @param routeName got from moduleConfig
 * @param homeScreens One (or more) screens for the main component (homepage) of the module
 * @param stackScreens Other screens of the module
 * @returns
 */

// !! TS-hack ! 🍔
// Writing `typeof createNativeStackNavigator<ParamList>` seems to be syntaxically illegal... So I got a workaround :
// These type declarations are dump from declaration file of createNativeStackNavigator
// I declare an interface that has the same signature as createNativeStackNavigator function
// With an interface, I can write `ICreateNativeStackNavigatorInterface<ParamList>` like I would write `typeof createNativeStackNavigator<ParamList>` !
// The downside is that if ReactNavigation change signature of createNativeStackNavigator, it wouldn't be applied here 🙁
declare function NativeStackNavigator({
  id,
  initialRouteName,
  children,
  screenListeners,
  screenOptions,
  ...rest
}: NativeStackNavigatorProps): JSX.Element;
declare interface ICreateNativeStackNavigatorInterface<ParamList extends ParamListBase> {
  (): import('@react-navigation/native').TypedNavigator<
    ParamList,
    StackNavigationState<ParamListBase>,
    NativeStackNavigationOptions,
    NativeStackNavigationEventMap,
    typeof NativeStackNavigator
  >;
}
export function createModuleNavigator<ParamList extends ParamListBase>(
  routeName: string,
  homeScreens: (Stack: ReturnType<ICreateNativeStackNavigatorInterface<ParamList>>) => React.ReactNode,
  stackScreens?: (Stack: ReturnType<typeof createNativeStackNavigator>) => React.ReactNode,
) {
  if (stackScreens) ModuleScreens.register(routeName, <MainStack.Group key={routeName}>{stackScreens(MainStack)}</MainStack.Group>);
  const ModuleStack = createNativeStackNavigator<ParamList>();
  return () => <ModuleStack.Navigator screenOptions={navBarOptions}>{homeScreens(ModuleStack)}</ModuleStack.Navigator>;
}
