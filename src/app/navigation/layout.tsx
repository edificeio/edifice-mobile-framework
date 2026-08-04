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
import { StackPresentationTypes } from 'react-native-screens';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { NavBarLine } from '~/framework/components/navigation';
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

export const navigationLightTheme: Theme = deepmerge<Theme, DeepPartial<Theme>>(DefaultTheme, {
  colors: {
    background: theme.ui.background.card.toString(),
    border: theme.palette.grey.cloudy.toString(),
    card: theme.ui.background.card.toString(),
    notification: theme.palette.primary.regular.toString(),
    primary: theme.palette.primary.regular.toString(),
    text: theme.ui.text.regular.toString(),
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

    headerBackground: () => <NavBarLine />,
    headerShadowVisible: false,
    headerTintColor: navTheme.colors.text,
    headerTitleAlign: 'center',
    statusBarStyle: 'light',
  }) satisfies NativeStackNavigatorProps['screenOptions'];

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

export const defaultTabOptions: BottomTabNavigatorProps['screenOptions'] = ({ navigation, theme: navTheme }) => {
  return {
    freezeOnBlur: true,
    headerShown: false,
    lazy: true,
    popToTopOnBlur: true,
    tabBarActiveTintColor: theme.palette.secondary.dark.toString(),
    tabBarButton: props => <PlatformPressable {...props} pressColor="transparent" />,
    tabBarIconStyle: {
      height: tabBarIconSize,
      width: tabBarIconSize + UI_SIZES.spacing.minor,
    },
    tabBarInactiveTintColor: theme.palette.grey.black.toString(),
    tabBarStyle: {
      backgroundColor: navTheme.colors.background,
      borderTopColor: navTheme.colors.border,
      borderTopWidth: 1,
      ...getTabBarStyleForNavState(navigation.getState()),
    },
  };
};

export const tabBarIconSize = UI_SIZES.elements.icon.small;

const activeTabIconWidth = getScaleWidth(36);
const activeTabIconHeight = getScaleWidth(28);

export const styles = StyleSheet.create({
  // Rounded background of the active tab. Bigger than the icon container: it overflows instead of
  // pushing the tab label, since that container has a fixed height.
  activeTabIcon: {
    backgroundColor: theme.palette.primary.light.toString(),
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
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
