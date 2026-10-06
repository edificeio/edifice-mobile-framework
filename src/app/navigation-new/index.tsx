/**
 * Navigation
 *
 * All navigation-powered structure of the app
 *
 * RootStack (all modules' modals) -> Tabs -> TabStack (all modules' screns)
 */

import React from 'react';

import { createStaticNavigation } from '@react-navigation/native';

import { useRootStackNavigation } from './rootStack';
import { useScreenTelemetry } from './telemetry';

export const RootNavigation = React.memo(function () {
  // Ensure static navigation is only created once.
  const isMounted = React.useRef(false);
  if (isMounted.current) {
    console.error(`[Navigation] Static navigation was re-rendered and this should not happen.`);
  }
  React.useEffect(() => {
    isMounted.current = true;
  }, []);

  const routes = useRootStackNavigation();
  const Navigation = createStaticNavigation(routes);
  const { onReady, onScreenChange, onUnhandledAction } = useScreenTelemetry();
  return <Navigation onReady={onReady} onStateChange={onScreenChange} onUnhandledAction={onUnhandledAction} />;
});
RootNavigation.displayName = 'RootNavigation';
