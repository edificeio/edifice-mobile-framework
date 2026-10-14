/**
 * Navigation
 *
 * All navigation-powered structure of the app
 *
 * RootStack (all modules' modals) -> Tabs -> TabStack (all modules' screns)
 */

import React from 'react';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { createStaticNavigation } from '@react-navigation/native';

import { ToastContainer } from '~/framework/components/toast';
import { CloudMessagingProvider } from '~/framework/util/notifications/cloudMessaging';

import { ConfirmRemoveProvider } from './confirm-remove';
import { useRootStackNavigation } from './rootStack';
import { useScreenTelemetry } from './telemetry';
import { navigationLightTheme } from './theme';

export * from './screen';
export * from './types';
export * from './confirm-remove';
export { getTabScreenName } from './tabs';

export interface AppNavigationProps {
  /** Called once the navigation is ready, after the telemetry. Must be stable (the navigation is not meant to re-render). */
  onReady?: () => void;
}

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
  const { onReady: onReadyTelemetry, onScreenChange, onUnhandledAction } = useScreenTelemetry();
  const onReady = React.useCallback(() => {
    onReadyTelemetry();
    _onReady?.();
  }, [_onReady, onReadyTelemetry]);
  return (
    <Navigation
      theme={navigationLightTheme}
      onReady={onReady}
      onStateChange={onScreenChange}
      onUnhandledAction={onUnhandledAction}
    />
  );
});
AppNavigation.displayName = 'AppNavigation';
