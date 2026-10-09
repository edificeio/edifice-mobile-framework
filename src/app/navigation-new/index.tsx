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

import { CloudMessagingProvider } from '~/framework/util/notifications/cloudMessaging';

import { ConfirmRemoveProvider } from './confirm-remove';
import { useRootStackNavigation } from './rootStack';
import { useScreenTelemetry } from './telemetry';

export * from './screen';
export * from './types';
export * from './confirm-remove';

export const AppNavigation = React.memo(function () {
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
          <Navigator />
        </CloudMessagingProvider>
      </BottomSheetModalProvider>
    </ConfirmRemoveProvider>
  ));
  const Navigation = createStaticNavigation(rootStack);
  const { onReady, onScreenChange, onUnhandledAction } = useScreenTelemetry();
  return <Navigation onReady={onReady} onStateChange={onScreenChange} onUnhandledAction={onUnhandledAction} />;
});
AppNavigation.displayName = 'AppNavigation';
