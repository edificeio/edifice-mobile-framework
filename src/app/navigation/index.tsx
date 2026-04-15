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
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootNavigation } from './root-navigation';
import navigationLightTheme from './theme';
import { AllModulesNavigationParams, NavigationRootParams } from './types';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export const NavigationContainer = React.forwardRef(function NavigationContainer(
  { theme: _, ...props }: NavigationContainerProps,
  ref: React.Ref<NavigationContainerRef<NavigationRootParams>>,
) {
  return <RNNavigationContainer ref={ref} theme={navigationLightTheme} {...props} />;
});

export function AppNavigation() {
  const navigationRef = useNavigationContainerRef<NavigationRootParams>();
  const onReady = React.useCallback<NonNullable<NavigationContainerProps['onReady']>>(() => {
    __DEV__ && console.info('[Navigation] Ready');
  }, []);
  const onUnhandledAction = React.useCallback<NonNullable<NavigationContainerProps['onUnhandledAction']>>(action => {
    __DEV__ && console.error('[Navigation] Unhandled action', action);
  }, []);

  /**
   * Note on initialState prop :
   * Providing this prop overrides the default behaviour of deep linking of react-navigation.
   * We need set up initialState to open the app tot he right state regarding to authentication state.
   * In the future, make sure deep linking will be handled in addition to this behaviour.
   * @see https://reactnavigation.org/docs/navigation-container#initialstate
   */

  return (
    <NavigationContainer ref={navigationRef} onReady={onReady} onUnhandledAction={onUnhandledAction}>
      <BottomSheetModalProvider>
        <RootNavigation />
      </BottomSheetModalProvider>
    </NavigationContainer>
  );
}

/**
 * Dispatch given actions, can work with multiple actions as an array.
 * @param navigation
 * @param actions
 */
export const navigationDispatchMultiple = <ParamList extends AllModulesNavigationParams, RouteName extends keyof ParamList>(
  navigation: NativeStackScreenProps<ParamList, RouteName>['navigation'],
  actions: Parameters<typeof navigation.dispatch>[0] | Parameters<typeof navigation.dispatch>[0][],
) => {
  if (Array.isArray(actions)) {
    actions.forEach(a => {
      navigation.dispatch(a);
    });
  } else {
    navigation.dispatch(actions);
  }
};

export default AppNavigation;
