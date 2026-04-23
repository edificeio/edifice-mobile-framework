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

import { RootModule } from '~/app/module';
import { useAvailableModules } from '~/app/modules';
import { RootToastContainer } from '~/framework/components/toast';
import { getAuthReduxNavigationState } from '~/framework/modules/auth/new-navigation';
import { selectors } from '~/framework/modules/auth/redux/reducer';
import modalScreens from '~/framework/navigation/modals/navigator';

import { defaultScreenOptions, StackScreenLayout } from './layout';
import { MainNavigation, MainNavigationOptions } from './main-navigation';
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
      // __DEV__ && console.info('[Navigation] onStateChange', action);
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
  const showAppContent = session && !requirement;
  // const navigationKey = showAppContent ? session.logTimestamp.toString() : 'guest';

  // ToDo : screen tracking
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
      showAppContent
        ? { routes: [{ name: TABS_ROUTE_NAME }] }
        : getAuthReduxNavigationState({
            accounts,
            connected,
            lastDeletedAccount,
            pending,
            requirement,
            showOnboarding,
          }),
    [accounts, connected, lastDeletedAccount, pending, requirement, showAppContent, showOnboarding],
  );

  /**
   * Here we handle new navigation state and the need to reset manually.
   * No reset must be done if this is a the initial render (initialState will handle it).
   * Else, we must compare nav state chages as string since it will be built with same values sometimes.
   */
  const navigationKey = React.useMemo(() => JSON.stringify(navigationState), [navigationState]);
  const previousNavigationKeyRef = React.useRef(navigationKey);
  const isMountedRef = React.useRef(false);
  if (previousNavigationKeyRef.current !== navigationKey) {
    previousNavigationKeyRef.current = navigationKey;
    navigationRef.isReady() && navigationRef.reset(navigationState);
    isMountedRef.current = true;
  }

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
        <RootStack.Navigator
          screenLayout={StackScreenLayout}
          screenOptions={defaultScreenOptions}
          UNSTABLE_routeNamesChangeBehavior="lastUnhandled">
          {/**
           * Show main screen depending on session data and requirements.
           * We can't remove the `tabs` route since react-navigation has to that it exists to navigate to it.
           * So, we handle this by using another empty render component
           */}
          <RootStack.Screen
            options={MainNavigationOptions}
            name={TABS_ROUTE_NAME}
            component={showAppContent ? MainNavigation : MainNavigationEmpty}
          />

          {/**
           * Add root modules that belongs to the framework here
           * navigationKey is useful here to get the user out of these screens if it is logged out in them
           * @see https://reactnavigation.org/docs/auth-flow/#removing-shared-screens-when-auth-state-changes
           */}
          <RootStack.Group navigationKey={navigationKey}>
            {RootModule.allRootModules.map(module =>
              module.renderScreens ? (
                <RootStack.Group key={module.name}>
                  {module.renderScreens(RootStack as ReturnType<typeof createNativeStackNavigator>)}
                </RootStack.Group>
              ) : null,
            )}
            {modalScreens}
          </RootStack.Group>
        </RootStack.Navigator>
        <RootToastContainer />
      </BottomSheetModalProvider>
    </NavigationContainer>
  );
}

function MainNavigationEmpty() {
  return null;
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
