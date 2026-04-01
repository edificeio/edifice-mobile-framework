import React from 'react';
import { ActivityIndicator } from 'react-native';

import { NativeStackNavigatorProps } from '@react-navigation/native-stack';
import ErrorBoundary from 'react-native-error-boundary';

import theme from '~/app/theme';
import ErrorScreenView from '~/framework/components/screen/error';

export function ScreenLayout({ children }: React.PropsWithChildren) {
  // ToDo: Track error

  return (
    <ErrorBoundary FallbackComponent={ErrorScreenView}>
      <React.Suspense fallback={<ActivityIndicator color={theme.palette.primary.regular} />}>{children}</React.Suspense>
    </ErrorBoundary>
  );
}

export const screenOptions: NativeStackNavigatorProps['screenOptions'] = ({ theme: navTheme }) => ({
  headerBackButtonDisplayMode: 'minimal',
  headerTintColor: navTheme.colors.text,
  headerTitleAlign: 'center',
  statusBarStyle: 'light',
});
