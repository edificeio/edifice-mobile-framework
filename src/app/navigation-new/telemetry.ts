/**
 * Navigation telemetry
 *
 * Exposes function to handle screen tracking when the navigation state changes.
 */

import React from 'react';

import { findFocusedRoute, NavigationContainerProps, NavigationState, PartialState } from '@react-navigation/native';

import { Trackers } from '~/framework/util/tracker';

export interface ScreenTelemetryOptions {
  /**
   * Routes not to track: the ones that only host another navigation container (see `delegatesTelemetry`).
   * It must be a stable reference.
   */
  ignoredRoutes?: ReadonlySet<string>;
}

export const useScreenTelemetry = ({ ignoredRoutes }: ScreenTelemetryOptions = {}) => {
  const previousRouteRef = React.useRef<string>(undefined);

  /** Tracks the screen, unless it is the one already tracked or one that is ignored. */
  const logRoute = React.useCallback(
    (routeName: string) => {
      if (routeName === previousRouteRef.current || ignoredRoutes?.has(routeName)) return;
      __DEV__ && console.debug(`[Navigation] Focused screen: ${routeName}`);
      Trackers.trackView(routeName.split('/'));
      previousRouteRef.current = routeName;
    },
    [ignoredRoutes],
  );

  const logNavigationState = React.useCallback(
    (navigationState: Readonly<NavigationState> | Readonly<PartialState<NavigationState>> | undefined) => {
      const currentRoute = navigationState && findFocusedRoute(navigationState);
      if (currentRoute) logRoute(currentRoute.name);
    },
    [logRoute],
  );

  const onScreenChange = React.useCallback(
    (navigationState: Readonly<NavigationState> | undefined) => {
      logNavigationState(navigationState);
    },
    [logNavigationState],
  );

  const onUnhandledAction = React.useCallback<NonNullable<NavigationContainerProps['onUnhandledAction']>>(action => {
    __DEV__ && console.error('[Navigation] Unhandled action', action);
  }, []);

  const onReady = React.useCallback<NonNullable<NavigationContainerProps['onReady']>>(() => {
    __DEV__ && console.debug('[Navigation] Ready');
  }, []);

  return { logNavigationState, logRoute, onReady, onScreenChange, onUnhandledAction };
};
