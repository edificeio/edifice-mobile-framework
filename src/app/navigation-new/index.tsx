/**
 * Navigation
 *
 * All navigation-powered structure of the app
 *
 * RootStack (all modules' modals) -> Tabs -> TabStack (all modules' screns)
 */

import React from 'react';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  createStaticNavigation,
  type NavigationContainerRefWithCurrent,
  useNavigationContainerRef,
} from '@react-navigation/native';

import { useTelemetryDelegatedRoutes } from '~/app/module/hooks';
import { ToastContainer } from '~/framework/components/toast';
import { CloudMessagingProvider } from '~/framework/util/notifications/cloudMessaging';
import { selectActiveAccount, useAccountsStore } from '~/modules/auth/store/accounts';

import { ConfirmRemoveProvider } from './confirm-remove';
import { useRootStackNavigation } from './root-stack';
import { useScreenTelemetry } from './telemetry';
import { navigationLightTheme } from './theme';

export { useIsModal } from './layout';
export * from './screen';
export * from './types';
export * from './confirm-remove';
export { getTabScreenName } from './tabs';

export interface AppNavigationProps {
  /** Called once the navigation is ready, after the telemetry. Must be stable (the navigation is not meant to re-render). */
  onReady?: () => void;
}

/**
 * Goes back to the home (the tabs, reset) each time an account signs in again (its `logTimestamp` is not the one of the previous
 * sign-in): the modals close and the screens the user was on are left.
 * Neither the stage nor the connected account tell it: signing in with the account that is already connected changes none of them, and
 * when the account changes, putting the previous one to sleep and connecting the next happen in the same tick, so the stage is never
 * rendered as signed out (which would have replaced the screens, modals included).
 * Listens to the store, instead of reading it with a hook: the navigation must not re-render.
 */
const useResetOnSignIn = (navigationRef: NavigationContainerRefWithCurrent<ReactNavigation.RootParamList>) => {
  React.useEffect(() => {
    // Last sign-in known: it is kept while nobody is connected, so the next one is compared to it
    let previous = selectActiveAccount(useAccountsStore.getState())?.logTimestamp;
    return useAccountsStore.subscribe(state => {
      const current = selectActiveAccount(state)?.logTimestamp;
      if (current === undefined || current === previous) return;
      // The first sign-in of the session starts the navigation from the home anyway
      if (previous !== undefined && navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: '$tabs' }] });
      }
      previous = current;
    });
  }, [navigationRef]);
};

export const AppNavigation = React.memo(function ({ onReady: _onReady }: AppNavigationProps) {
  // Ensure static navigation is only created once.
  const isMounted = React.useRef(false);
  if (isMounted.current) {
    console.error(`[Navigation] Static navigation was re-rendered and this should not happen.`);
  }
  React.useEffect(() => {
    isMounted.current = true;
  }, []);

  const rootStack = useRootStackNavigation().with(({ Navigator }) => (
    // Note : these providers depends on navigation so we can't put them in app providers.
    <ConfirmRemoveProvider>
      <BottomSheetModalProvider>
        <CloudMessagingProvider>
          <BottomSheetModalProvider>
            <Navigator />
            <ToastContainer />
          </BottomSheetModalProvider>
        </CloudMessagingProvider>
      </BottomSheetModalProvider>
    </ConfirmRemoveProvider>
  ));
  const Navigation = createStaticNavigation(rootStack);
  const navigationRef = useNavigationContainerRef();
  useResetOnSignIn(navigationRef);
  const ignoredRoutes = useTelemetryDelegatedRoutes();
  const { onReady: onReadyTelemetry, onScreenChange, onUnhandledAction } = useScreenTelemetry({ ignoredRoutes });
  const onReady = React.useCallback(() => {
    onReadyTelemetry();
    _onReady?.();
  }, [_onReady, onReadyTelemetry]);
  return (
    <Navigation
      ref={navigationRef}
      theme={navigationLightTheme}
      onReady={onReady}
      onStateChange={onScreenChange}
      onUnhandledAction={onUnhandledAction}
    />
  );
});
AppNavigation.displayName = 'AppNavigation';
