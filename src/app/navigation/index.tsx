/**
 * Navigation
 *
 * Handles all navigation logic in the app.
 * This replace old `framework/util/navigation`.
 * Access all navigation util with hooks exported here.
 */

import * as React from 'react';

import {
  NavigationContainerProps,
  NavigationContainerRef,
  NavigationContainer as RNNavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';

import { RootNavigation } from './root-navigation';
import navigationTheme from './theme';
import { NavigationRootParams } from './types';

export const NavigationContainer = React.forwardRef(function NavigationContainer(
  { theme: _, ...props }: NavigationContainerProps,
  ref: React.Ref<NavigationContainerRef<NavigationRootParams>>,
) {
  return <RNNavigationContainer ref={ref} theme={navigationTheme} {...props} />;
});

export function AppNavigation() {
  const navigationRef = useNavigationContainerRef<NavigationRootParams>();
  const onReady = React.useCallback<NonNullable<NavigationContainerProps['onReady']>>(() => {}, []);

  return (
    <NavigationContainer ref={navigationRef} onReady={onReady}>
      <RootNavigation />
    </NavigationContainer>
  );
}

export default AppNavigation;
