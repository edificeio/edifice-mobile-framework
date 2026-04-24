import React from 'react';
import { ActivityIndicator } from 'react-native';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { BottomTabNavigatorProps } from '@react-navigation/bottom-tabs';
import { NavigationProp, ScreenLayoutArgs } from '@react-navigation/native';
import { NativeStackNavigationOptions, NativeStackNavigatorProps } from '@react-navigation/native-stack';
import ErrorBoundary from 'react-native-error-boundary';
import { StackPresentationTypes } from 'react-native-screens';

import theme from '~/app/theme';
import ErrorScreenView from '~/framework/components/screen/error';
import { TextSizeStyle } from '~/framework/components/text';
import { ToastContainer } from '~/framework/components/toast';

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

export function StackScreenLayout({
  children,
  options,
}: ScreenLayoutArgs<
  AllModulesNavigationParams,
  AllModulesScreenNames,
  NativeStackNavigationOptions,
  NavigationProp<AllModulesNavigationParams>
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

export const defaultTabOptions: BottomTabNavigatorProps['screenOptions'] = ({ theme: navTheme }) => ({
  freezeOnBlur: true,
  headerShown: false,
  lazy: true,
  popToTopOnBlur: true,
  tabBarInactiveTintColor: theme.ui.text.light.toString(),
  tabBarLabelStyle: {
    fontSize: TextSizeStyle.Small.fontSize,
  },
  tabBarStyle: {
    backgroundColor: navTheme.colors.background,
    borderTopColor: navTheme.colors.border,
    borderTopWidth: 1,
  },
});
