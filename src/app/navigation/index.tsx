/**
 * Navigation
 *
 * Handles all navigation logic in the app.
 * This replace old `framework/util/navigation`.
 * Access all navigation util with hooks exported here.
 */

import * as React from 'react';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  NavigationContainerProps,
  NavigationContainerRef,
  NavigationContainer as RNNavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { useAvailableModules } from '~/app/modules';
import { RootToastContainer } from '~/framework/components/toast';
import { getAuthReduxNavigationState } from '~/framework/modules/auth/new-navigation';
import { selectors } from '~/framework/modules/auth/redux/reducer';

import { defaultScreenOptions, StackScreenLayout } from './layout';
import { MainNavigation, MainNavigationOptions } from './main-navigation';
import { renderRootModulesScreens } from './root-navigation';
import { useTrackScreen } from './telemetry';
import navigationLightTheme from './theme';
import { AllModulesNavigationParams, NavigationRootParams } from './types';

// Note: import tabModules register to initialize it
// remove when all modules will be ported to new module system
import '~/framework/navigation/tabModules';

export const NavigationContainer = React.forwardRef(function NavigationContainer(
  { theme: _, ...props }: NavigationContainerProps,
  ref: React.Ref<NavigationContainerRef<NavigationRootParams>>,
) {
  return <RNNavigationContainer ref={ref} theme={navigationLightTheme} {...props} />;
});

export const RootStack = createNativeStackNavigator<NavigationRootParams>();
export const TABS_ROUTE_NAME = 'tabs' as const;

export function AppNavigation() {
  const navigationRef = useNavigationContainerRef<NavigationRootParams>();
  const onReady = React.useCallback<NonNullable<NavigationContainerProps['onReady']>>(() => {
    __DEV__ && console.info('[Navigation] Ready');
  }, []);
  const onUnhandledAction = React.useCallback<NonNullable<NavigationContainerProps['onUnhandledAction']>>(action => {
    __DEV__ && console.error('[Navigation] Unhandled action', action);
  }, []);
  const trackScreen = useTrackScreen();
  const onStateChange = React.useCallback<NonNullable<NavigationContainerProps['onStateChange']>>(
    state => {
      // __DEV__ && console.info('[Navigation] onStateChange', state);
      trackScreen(state);
    },
    [trackScreen],
  );

  const session = useSelector(selectors.session);
  const accounts = useSelector(selectors.accounts);
  const requirement = useSelector(selectors.requirement);
  const pending = useSelector(selectors.pending);
  const showOnboarding = useSelector(selectors.showOnboarding);
  const lastDeletedAccount = useSelector(selectors.lastDeletedAccount);
  const connected = useSelector(selectors.connected);
  const userIsCompletelyLoggedIn = session && !requirement;

  // ToDo : deep linking

  /**
   * @deprecated remove this when all modules are ported to the new module system
   */
  useAvailableModules(session);

  /**
   * Below handing redux-based navigation state.
   * `navigationState` depends on redux data, and this is used as `initialState` for navigation.
   * However, `initialState` is used once at the app startup. After that, we have to manually reset the state when needed (login/logout).
   */
  const navigationState = React.useMemo(
    () =>
      userIsCompletelyLoggedIn
        ? undefined
        : getAuthReduxNavigationState({
            accounts,
            connected,
            lastDeletedAccount,
            pending,
            requirement,
            showOnboarding,
          }),
    [accounts, connected, lastDeletedAccount, pending, requirement, userIsCompletelyLoggedIn, showOnboarding],
  );

  /**
   * Here we handle new navigation state and the need to reset manually.
   * No reset must be done if this is a the initial render (initialState will handle it).
   * Else, we must compare nav state chages as string since it will be built with same values sometimes.
   */
  const navigationKey = React.useMemo(() => JSON.stringify(navigationState), [navigationState]);
  const initialNavigationDone = React.useRef(false);
  React.useEffect(() => {
    __DEV__ && console.info('[Navigation] Auth nav key changed ', navigationKey);
    initialNavigationDone.current && navigationRef.isReady() && navigationState && navigationRef.reset(navigationState);
    initialNavigationDone.current = true;
    // Do not depend on `navigationState` since it can be recreated when session updates while being logged in
  }, [navigationKey, navigationRef]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={onReady}
      onUnhandledAction={onUnhandledAction}
      onStateChange={onStateChange}
      /**
       * Note on initialState prop :
       * Providing this prop overrides the default behaviour of deep linking of react-navigation.
       * We need set up initialState to open the app tot he right state regarding to authentication state.
       * In the future, make sure deep linking will be handled in addition to this behaviour.
       * @see https://reactnavigation.org/docs/navigation-container#initialstate
       */
      initialState={navigationState}>
      <BottomSheetModalProvider>
        <RootStack.Navigator screenLayout={StackScreenLayout} screenOptions={defaultScreenOptions}>
          {/**
           * Show main screen depending on session data and requirements.
           * We can't remove the `tabs` route since react-navigation has to that it exists to navigate to it.
           * So, we handle this by using another empty render component
           */}
          {userIsCompletelyLoggedIn ? (
            <RootStack.Screen options={MainNavigationOptions} name={TABS_ROUTE_NAME} component={MainNavigation} />
          ) : (
            <RootStack.Group navigationKey={navigationKey}>{renderRootModulesScreens(RootStack)}</RootStack.Group>
          )}
        </RootStack.Navigator>
        <RootToastContainer />
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
