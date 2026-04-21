/**
 * Navigation telemetry
 *
 * Exposes function to handle screen tracking when the navigation state changes.
 */

import React from 'react';

import { findFocusedRoute, NavigationState } from '@react-navigation/native';

import { Trackers } from '~/framework/util/tracker';

export const useTrackScreen = () => {
  const previousRouteRef = React.useRef<ReturnType<typeof findFocusedRoute>>(undefined);
  return React.useCallback((navigationState: Readonly<NavigationState> | undefined) => {
    const currentRoute = navigationState && findFocusedRoute(navigationState);
    if (currentRoute && currentRoute.name !== previousRouteRef.current?.name) {
      Trackers.trackView(currentRoute.name.split('/'));
      previousRouteRef.current = currentRoute;
    }
  }, []);
};
