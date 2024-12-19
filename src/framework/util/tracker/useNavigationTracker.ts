import * as React from 'react';

import { findFocusedRoute, InitialState, type Route } from '@react-navigation/native';

import { Trackers } from '.';

const customRouteNameLogicMap: { [key: string]: (route: Omit<Route<string, object | undefined>, 'key'>) => string } = {};

export const registerCustomRouteTracking = <R = Omit<Route<string, object | undefined>, 'key'>>(
  routeName: string,
  logic: (route: R) => string,
) => {
  customRouteNameLogicMap[routeName] = logic as (route: Omit<Route<string, object | undefined>, 'key'>) => string;
};

const trackViewIfNeeded = async (
  routeNameRef: React.MutableRefObject<string | undefined>,
  route?: Omit<Route<string, object | undefined>, 'key'> | undefined,
) => {
  const previousRouteName = routeNameRef.current;
  let currentRouteName = route?.name;

  if (route && currentRouteName && customRouteNameLogicMap[currentRouteName] !== undefined) {
    currentRouteName = customRouteNameLogicMap[currentRouteName](route);
  }

  if (currentRouteName && previousRouteName !== currentRouteName) {
    // Save the current route name for later comparison
    routeNameRef.current = currentRouteName;

    // Replace the line below to add the tracker from a mobile analytics SDK
    await Trackers.trackView(currentRouteName.split('/'));
  }
};

export const useNavigationTracker = () => {
  const routeNameRef = React.useRef<string>();
  return React.useCallback(
    (navState: InitialState | undefined) =>
      trackViewIfNeeded(routeNameRef, navState ? findFocusedRoute(navState) : undefined /*, navigationRef.getCurrentRoute()*/),
    [],
  );
};
