/**
 * Navigation telemetry
 *
 * Exposes function to handle screen tracking when the navigation state changes.
 */

import React from 'react';

import { findFocusedRoute, NavigationContainerProps, NavigationState } from '@react-navigation/native';

import { Trackers } from '~/framework/util/tracker';

export const useScreenTelemetry = () => {
  const previousRouteRef = React.useRef<ReturnType<typeof findFocusedRoute>>(undefined);

  const onScreenChange = React.useCallback((navigationState: Readonly<NavigationState> | undefined) => {
    const currentRoute = navigationState && findFocusedRoute(navigationState);
    if (currentRoute && currentRoute.name !== previousRouteRef.current?.name) {
      __DEV__ && console.debug(`[Navigation] Focused screen: ${currentRoute.name}`);
      Trackers.trackView(currentRoute.name.split('/'));
      previousRouteRef.current = currentRoute;
    }
  }, []);

  const onUnhandledAction = React.useCallback<NonNullable<NavigationContainerProps['onUnhandledAction']>>(action => {
    __DEV__ && console.error('[Navigation] Unhandled action', action);
  }, []);

  const onReady = React.useCallback<NonNullable<NavigationContainerProps['onReady']>>(() => {
    __DEV__ && console.debug('[Navigation] Ready');
  }, []);

  return { onReady, onScreenChange, onUnhandledAction };
};
