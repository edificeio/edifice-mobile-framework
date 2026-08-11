/**
 * Everything that custoimize layout and theming for navigation elements.
 */

import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { BottomTabNavigatorProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { DefaultTheme, NavigationProp, ScreenLayoutArgs, Theme } from '@react-navigation/native';
import { NativeStackNavigationOptions, NativeStackNavigatorProps } from '@react-navigation/native-stack';
import deepmerge from 'deepmerge';
import ErrorBoundary from 'react-native-error-boundary';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import { StackPresentationTypes } from 'react-native-screens';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { BarLine } from '~/framework/components/navigation';
import ErrorScreenView from '~/framework/components/screen/error';
import { TextFontStyle } from '~/framework/components/text';
import { ToastContainer } from '~/framework/components/toast';
import { getTabBarStyleForNavState } from '~/framework/navigation/hideTabBarAndroid';
import { CloudMessagingNavigationHandler } from '~/framework/util/notifications/cloudMessaging';
import { DeepPartial } from '~/utils/types';

import { AllModulesNavigationParams, AllModulesScreenNames } from './types';

const modalPresentations: (StackPresentationTypes | 'card')[] = [
  'containedModal',
  'containedTransparentModal',
  'formSheet',
  'fullScreenModal',
  'modal',
  'pageSheet',
  'transparentModal',
];

export const hasNavigationLine = !!theme.ui.navigation.line;

export const hasActiveTabHighlight = !!theme.ui.navigation.tabBar.highlight;

// Height the system keeps for itself at the bottom of the screen, for its own bar. Read from the
// same place as react-navigation, and not from `UI_SIZES.screen.bottomInset`, which reports 0 below
// Android 16 even though the app draws behind the system bar there.
const tabBarBottomInset = initialWindowMetrics?.insets.bottom ?? 0;

export const navigationLightTheme: Theme = deepmerge<Theme, DeepPartial<Theme>>(DefaultTheme, {
  colors: {
    background: theme.ui.background.card.toString(),
    border: theme.palette.grey.cloudy.toString(),
    card: theme.ui.navigation.navBar.background.toString(),
    notification: theme.palette.primary.regular.toString(),
    primary: theme.palette.primary.regular.toString(),
    text: theme.ui.navigation.navBar.tint.toString(),
  },
  dark: false,
  fonts: {
    bold: { fontFamily: TextFontStyle.Bold.fontFamily, fontWeight: 'bold' },
    heavy: { fontFamily: TextFontStyle.Bold.fontFamily, fontWeight: 'bold' },
    medium: { fontFamily: TextFontStyle.Bold.fontFamily, fontWeight: 'bold' },
    regular: { fontFamily: TextFontStyle.Bold.fontFamily, fontWeight: 'bold' },
  },
});

export default navigationLightTheme;

export function BaseStackScreenLayout({
  children,
  options,
}: Parameters<NonNullable<NativeStackNavigatorProps['screenLayout']>>[0]) {
  // ToDo: Track error
  const isModal = options.presentation && modalPresentations.includes(options.presentation);
  const Wrapper = isModal ? BottomSheetModalProvider : React.Fragment;

  return (
    <Wrapper>
      <ErrorBoundary FallbackComponent={ErrorScreenView}>
        <React.Suspense fallback={<ActivityIndicator color={theme.palette.primary.regular} />}>{children}</React.Suspense>
      </ErrorBoundary>
      {isModal && <ToastContainer />}
    </Wrapper>
  );
}

export const defaultScreenOptions = ({ theme: navTheme }) =>
  ({
    // ToDo: change this options for a minimal stack (no header). Use LeafStack for stack navigator that shows header.
    headerBackButtonDisplayMode: 'minimal',
    // Only themes declaring a line need a custom background. Without it, react-navigation keeps
    // painting the header itself so current behavior is preserved.
    ...(hasNavigationLine && {
      headerBackground: () => (
        <BarLine background={theme.ui.navigation.navBar.background} bar="navBar" line={theme.ui.navigation.line} />
      ),
      headerShadowVisible: false,
    }),
    headerTintColor: navTheme.colors.text,
    headerTitleAlign: 'center',
    statusBarStyle: 'light',
  }) satisfies NativeStackNavigatorProps['screenOptions'];

// for a screen drawing its own content behind the navBar. Use this instead of `headerTransparent`
// alone: the inherited `headerBackground` would hide that content under an opaque bar.
export const transparentHeaderOptions = {
  headerBackground: undefined,
  headerTransparent: true,
} as const satisfies NativeStackNavigationOptions;

export function TabScreenLayout({
  children,
  ...props
}: ScreenLayoutArgs<
  AllModulesNavigationParams,
  AllModulesScreenNames,
  NativeStackNavigationOptions,
  NavigationProp<AllModulesNavigationParams>
>) {
  // Redirect push notification when tab screens is mounted. We know we are logged at this time.
  return (
    <>
      <CloudMessagingNavigationHandler />
      <BaseStackScreenLayout {...props}>{children}</BaseStackScreenLayout>
    </>
  );
}

export const defaultTabOptions: BottomTabNavigatorProps['screenOptions'] = ({ navigation }) => {
  return {
    freezeOnBlur: true,
    headerShown: false,
    lazy: true,
    popToTopOnBlur: true,
    tabBarActiveTintColor: theme.ui.navigation.tabBar.tintFocus.toString(),
    tabBarButton: props => (
      <PlatformPressable {...props} pressColor="transparent" style={[props.style, hasNavigationLine && styles.tabBarButton]} />
    ),
    tabBarIconStyle: styles.tabBarIcon,
    tabBarInactiveTintColor: theme.ui.navigation.tabBar.tintBlur.toString(),
    ...(hasNavigationLine && {
      tabBarBackground: () => (
        <BarLine background={theme.ui.navigation.tabBar.background} bar="tabBar" line={theme.ui.navigation.line} />
      ),
    }),
    tabBarStyle: [styles.tabBar, hasNavigationLine && styles.tabBarWithLine, getTabBarStyleForNavState(navigation.getState())],
  };
};

export const tabBarIconSize = UI_SIZES.elements.icon.small;

const activeTabIconWidth = getScaleWidth(36);
const activeTabIconHeight = getScaleWidth(28);

export const styles = StyleSheet.create({
  // rounded background of the active tab. Bigger than the icon container: it overflows instead of
  // pushing the tab label, since that container has a fixed height.
  activeTabIcon: {
    backgroundColor: theme.ui.navigation.tabBar.highlight?.toString(),
    borderRadius: activeTabIconHeight / 2,
    height: activeTabIconHeight,
    width: activeTabIconWidth,
  },

  headerBackButton: {
    // Override items padding because react-navigation's styling is broken
    marginLeft: 0,
    marginRight: 0,
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  headerButton: {
    // Override items padding because react-navigation's styling is broken
    marginLeft: 0,
    marginRight: 0,
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  tabBar: {
    backgroundColor: theme.ui.navigation.tabBar.background.toString(),
    borderTopColor: navigationLightTheme.colors.border,
    borderTopWidth: 1,
  },
  // matching the spacing defined by design.
  //top padding includes the 2pt line thickness.
  tabBarButton: {
    gap: UI_SIZES.spacing.tiny,
    paddingBottom: 0,
    paddingHorizontal: UI_SIZES.spacing.minor,
    paddingTop: UI_SIZES.border.small + UI_SIZES.spacing.minor,
  },
  tabBarIcon: {
    height: tabBarIconSize,
    // add a little extra width so font icons are not clipped.
    width: tabBarIconSize + UI_SIZES.spacing.minor,
  },
  // fixed height matching design.
  // include bottom safearea manually.
  tabBarWithLine: {
    borderTopWidth: 0,
    height: UI_SIZES.elements.tabbarHeight + UI_SIZES.border.small + tabBarBottomInset,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconFont: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
