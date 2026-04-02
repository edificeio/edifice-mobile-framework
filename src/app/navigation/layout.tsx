import React from 'react';
import { ActivityIndicator } from 'react-native';

import { BottomTabNavigatorProps } from '@react-navigation/bottom-tabs';
import { NativeStackNavigatorProps } from '@react-navigation/native-stack';
import ErrorBoundary from 'react-native-error-boundary';

import theme from '~/app/theme';
import ErrorScreenView from '~/framework/components/screen/error';
import { TextSizeStyle } from '~/framework/components/text';

export function StackScreenLayout({ children }: React.PropsWithChildren) {
  // ToDo: Track error

  return (
    <ErrorBoundary FallbackComponent={ErrorScreenView}>
      <React.Suspense fallback={<ActivityIndicator color={theme.palette.primary.regular} />}>{children}</React.Suspense>
    </ErrorBoundary>
  );
}

export const defaultScreenOptions: NativeStackNavigatorProps['screenOptions'] = ({ theme: navTheme }) => ({
  headerBackButtonDisplayMode: 'minimal',
  headerTintColor: navTheme.colors.text,
  headerTitleAlign: 'center',
  statusBarStyle: 'light',
});

export function TabScreenLayout({ children }: React.PropsWithChildren) {
  return <StackScreenLayout>{children}</StackScreenLayout>;
}

export const defaultTabOptions: BottomTabNavigatorProps['screenOptions'] = ({ theme: navTheme }) => ({
  freezeOnBlur: true,
  headerShown: false,
  lazy: true,
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
