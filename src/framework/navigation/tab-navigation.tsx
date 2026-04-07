/**
 * The MainNavigation is nav hierarchy used when the user is logged in.
 * It includes all modules screens and TabBar screens.
 *
 * navBar shows up with the RootStack's NativeStackNavigator, not TabNavigator (because TabNavigator is not native).
 */
import * as React from 'react';
import { Platform, View } from 'react-native';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  CommonActions,
  EventMapBase,
  NavigationHelpers,
  NavigationState,
  ParamListBase,
  RouteProp,
  ScreenListeners,
  StackActions,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initialWindowMetrics, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { handleCloseModalActions } from './helper';
import { getTabBarStyleForNavState } from './hideTabBarAndroid';
import modals from './modals/navigator';
import { ModuleScreens } from './moduleScreens';
import { setConfirmQuitAction } from './nextTabJump';
import { computeTabRouteName, tabModules } from './tabModules';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture, PictureProps } from '~/framework/components/picture';
import useAuthNavigation from '~/framework/modules/auth/navigation/main-account/navigator';
import { assertSession } from '~/framework/modules/auth/reducer';
import { selectAggregatedApps } from '~/framework/modules/myapps/reducer';
import { buildModuleTabDisplayName } from '~/framework/modules/myapps/reducer/adapter';
import { navBarOptions } from '~/framework/navigation/navBar';
import Feedback from '~/framework/util/feedback/feedback';
import { AnyNavigableModule, AnyNavigableModuleConfig } from '~/framework/util/moduleTool';

const Tab = createBottomTabNavigator();

const createTabIcon = (
  moduleConfig: AnyNavigableModuleConfig,
  props: Parameters<Required<BottomTabNavigationOptions>['tabBarIcon']>[0],
) => {
  let dp: Partial<PictureProps> = { ...moduleConfig.displayPictureBlur };
  props.size = UI_SIZES.elements.tabbarIconSize;
  if (dp.type === 'Image') {
    dp.style = [dp.style, { height: props.size, width: props.size }];
  } else if (dp.type === 'Icon') {
    dp.size = dp.size ?? props.size;
    dp.color = dp.color ?? props.color;
    dp.name = dp.name ?? 'more_vert';
  } else if (dp.type === 'Svg') {
    dp.name = dp.name ?? 'ui-options';
    dp.height = props.size;
    dp.width = props.size;
    dp.fill = props.color;
  }
  if (props.focused) {
    dp = { ...dp, ...moduleConfig.displayPictureFocus, fill: props.color } as Partial<PictureProps>;
  }
  return <Picture {...dp} />;
};

const createTabOptions = (moduleConfig: AnyNavigableModuleConfig, tabLabel: string) => {
  return {
    tabBarIcon: props => {
      return createTabIcon(moduleConfig, props);
    },
    tabBarLabel: tabLabel,
    tabBarTestID: moduleConfig.testID ?? '',
  } as BottomTabNavigationOptions;
};

/**
 * The tab listener handles reset the stack inside a tab when leaving the tab + handle prevent back mechanic in this case.
 */
const tabListeners = ({ navigation }: { navigation: NavigationHelpers<ParamListBase> }) =>
  ({
    tabPress: event => {
      if (!event.target) return;
      const state = navigation.getState();
      let mustPrevent = state.routes[state.index].key !== event.target; // We must prevent default if we change tab, not if it's the same tab. This allow to use useScrollToTop.
      let doTabSwitch: boolean = true;
      state.routes.forEach((route, tabIndex) => {
        //
        if (tabIndex === state.index) {
          // Narrows to the current tab
          if (state.routes[state.index]?.state?.index !== undefined && state.routes[state.index]?.state?.index !== 0) {
            // Pop to top only if there at least two pages in the stack
            mustPrevent = true;
            navigation.dispatch(StackActions.popToTop());
            const newState = navigation.getState();
            doTabSwitch = newState !== state;
          }
        }
      });
      if (mustPrevent) {
        (event as unknown as React.SyntheticEvent).preventDefault(); // Types given by ScreenListeners are wrong here. We use SyntheticEvent as a fallback that contains preventDefault.
      }
      // Then, change tabs only if previous pop to top hadn't be blocked by preventRemove or something else...
      if (doTabSwitch) {
        navigation.navigate({ key: event.target });
      } else {
        // Else, register the tab change that will be handled in preventRemove callback
        setConfirmQuitAction(CommonActions.navigate({ key: event.target }));
      }
      // Feebback
      Feedback.tabPressed();
    },
  }) as ScreenListeners<NavigationState, EventMapBase>;

const stackListeners = ({ navigation }: { navigation: NavigationHelpers<ParamListBase> }) => ({
  transitionEnd: () => {
    handleCloseModalActions(navigation);
  },
});

export function TabStack({ module }: { module: AnyNavigableModule }) {
  const authNavigation = useAuthNavigation();
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={navBarOptions} initialRouteName={module.config.routeName} screenListeners={stackListeners}>
      {ModuleScreens.all}
      {authNavigation}
      {/** * iOS workaround:
       * Modals are already registered in RootStack, but on iOS
       * fullScreenModal screens may not appear correctly when triggered
       * from a nested TabStack NativeStack.
       * Registering modals here ensures they belong to the active
       * native stack so modal presentation works properly.
       * Intentional duplication
       *
       * — do not remove unless navigation  structure is refactored.
       * */}
      {Platform.OS === 'ios' ? modals : null}
    </Stack.Navigator>
  );
}

export function TabNavigation() {
  const session = assertSession();
  const aggregatedApps = useSelector(selectAggregatedApps);
  // Note: the following tabModules.get() reintanciates return value every time. We need to memoize it to avoid re-renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tabModulesCache = React.useMemo(() => tabModules.get(), [session]);

  const moduleTabStackCache = React.useMemo(
    () => tabModulesCache.map(module => <TabStack module={module} key={module.config.name} />),
    [tabModulesCache],
  );
  const moduleTabStackGetterCache = React.useMemo(() => moduleTabStackCache.map(ts => () => ts), [moduleTabStackCache]);
  const availableTabModules = React.useMemo(
    () =>
      tabModules
        .get()
        .filterAvailables(session, aggregatedApps.length === 0)
        .sort((a, b) => a.config.displayOrder - b.config.displayOrder),
    [session, aggregatedApps.length],
  );

  const tabRoutes = React.useMemo(() => {
    return availableTabModules.map(module => {
      const index = tabModulesCache.findIndex(tm => tm.config.name === module.config.name);
      if (index < 0) return undefined;
      const tabLabel = buildModuleTabDisplayName(module.config, aggregatedApps);
      return (
        <Tab.Screen
          key={module.config.routeName}
          name={computeTabRouteName(module.config.routeName)}
          options={createTabOptions(module.config, tabLabel)}
          listeners={tabListeners}>
          {moduleTabStackGetterCache[index]}
        </Tab.Screen>
      );
    });
  }, [availableTabModules, tabModulesCache, moduleTabStackGetterCache, aggregatedApps]);

  // Avoid bug when launching app after first push
  const initialBottomInset = initialWindowMetrics?.insets.bottom ?? UI_SIZES.screen.bottomInset;
  const bottomInsetRef = React.useRef(initialBottomInset);
  const { bottom: currentBottomInset } = useSafeAreaInsets();
  if (currentBottomInset !== bottomInsetRef.current && (currentBottomInset === 0 || currentBottomInset === initialBottomInset)) {
    bottomInsetRef.current = currentBottomInset;
  }

  const screenOptions: (props: { route: RouteProp<ParamListBase>; navigation: any }) => BottomTabNavigationOptions =
    React.useCallback(
      ({ _route, navigation }) => {
        return {
          // Prevent navBar flickering with this option
          freezeOnBlur: true,
          headerShown: false,
          lazy: false,
          tabBarActiveTintColor: theme.palette.primary.regular.toString(),
          // 😡 F U React Nav 6, using plain string instead of ColorValue
          tabBarHideOnKeyboard: Platform.select({ android: true, ios: false }),

          tabBarIconStyle: {
            height: UI_SIZES.elements.tabbarIconSize,
            marginTop: UI_SIZES.elements.tabbarLabelMarginTop,
            width: UI_SIZES.elements.tabbarIconSize,
          },

          // 😡 F U React Nav 6, using plain string instead of ColorValue
          tabBarInactiveTintColor: theme.ui.text.light.toString(),

          tabBarLabelStyle: { fontSize: 12, lineHeight: undefined, marginBottom: UI_SIZES.elements.tabbarLabelMarginBottom },

          tabBarStyle: {
            backgroundColor: theme.ui.background.card,
            borderTopColor: theme.palette.grey.cloudy,
            borderTopWidth: 1,
            elevation: 1,
            height: UI_SIZES.elements.tabbarHeight + bottomInsetRef.current,
            ...getTabBarStyleForNavState(navigation.getState()),
          },
        };
      },
      // Note: here we use a specific hack to ensure the tab bar height is not updated when the bottom inset changes accidentally.
      // This would cause tab navigation to be reinstanciated and tab state to be lost.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [bottomInsetRef.current],
    );

  return (
    <BottomSheetModalProvider>
      {tabRoutes.length ? (
        <Tab.Navigator id="tabs" screenOptions={screenOptions}>
          {tabRoutes}
        </Tab.Navigator>
      ) : (
        <View />
      )}
    </BottomSheetModalProvider>
  );
}
