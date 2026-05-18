/**
 * Everything that custoimize layout and theming for navigation elements.
 */

import React from 'react';
import { ActivityIndicator, Platform } from 'react-native';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { BottomTabNavigatorProps } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationProp, ScreenLayoutArgs, Theme } from '@react-navigation/native';
import { NativeStackNavigationOptions, NativeStackNavigatorProps } from '@react-navigation/native-stack';
import deepmerge from 'deepmerge';
import ErrorBoundary from 'react-native-error-boundary';
import { StackPresentationTypes } from 'react-native-screens';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import ErrorScreenView from '~/framework/components/screen/error';
import { TextFontStyle } from '~/framework/components/text';
import { ToastContainer } from '~/framework/components/toast';
import { getTabBarStyleForNavState } from '~/framework/navigation/hideTabBarAndroid';
import { DeepPartial } from '~/utils/types';

import { AllModulesNavigationParams, AllModulesScreenNames, NavigationRootParams } from './types';

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
    card: theme.palette.primary.regular.toString(),
    notification: theme.palette.primary.regular.toString(),
    primary: theme.palette.primary.regular.toString(),
    text: theme.ui.text.inverse.toString(),
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

export function StackScreenLayout({
  children,
  options,
}:
  | ScreenLayoutArgs<
      AllModulesNavigationParams,
      AllModulesScreenNames,
      NativeStackNavigationOptions,
      NavigationProp<AllModulesNavigationParams>
    >
  | ScreenLayoutArgs<
      NavigationRootParams,
      keyof NavigationRootParams,
      NativeStackNavigationOptions,
      NavigationProp<NavigationRootParams>
    >) {
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

export const defaultScreenOptions: NativeStackNavigatorProps['screenOptions'] = ({ theme: navTheme }) => ({
  headerBackButtonDisplayMode: 'minimal',
  headerTintColor: navTheme.colors.text,
  headerTitleAlign: 'center',
  statusBarStyle: 'light',
});

export function TabScreenLayout({
  children,
  ...props
}: ScreenLayoutArgs<
  AllModulesNavigationParams,
  AllModulesScreenNames,
  NativeStackNavigationOptions,
  NavigationProp<AllModulesNavigationParams>
>) {
  return <StackScreenLayout {...props}>{children}</StackScreenLayout>;
}

export const defaultTabOptions: BottomTabNavigatorProps['screenOptions'] = ({ navigation, theme: navTheme }) => {
  return {
    freezeOnBlur: true,
    headerShown: false,
    lazy: true,
    popToTopOnBlur: true,
    tabBarActiveTintColor: theme.palette.primary.regular.toString(),
    tabBarIconStyle: Platform.select({
      default: {
        height: UI_SIZES.elements.icon.small,
        width: UI_SIZES.elements.icon.small,
      },
      ios: undefined,
    }),
    tabBarInactiveTintColor: theme.ui.text.light.toString(),
    tabBarStyle: {
      backgroundColor: navTheme.colors.background,
      borderTopColor: navTheme.colors.border,
      borderTopWidth: 1,
      ...getTabBarStyleForNavState(navigation.getState()),
    },
  };
};

export const getTabBarIconSize = (defaultSize: number) =>
  Platform.select({ default: UI_SIZES.elements.icon.small, ios: defaultSize });
