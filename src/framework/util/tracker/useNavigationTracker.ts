import type { Route } from '@react-navigation/native';
import * as React from 'react';

import { navigationRef } from '~/framework/navigation/helper';

import { Trackers } from '.';

const customRouteNameLogicMap: { [key: string]: (route: Route<string, any>) => string } = {};

export const registerCustomRouteTracking = <R = Route<string, any>>(routeName: string, logic: (route: R) => string) => {
  customRouteNameLogicMap[routeName] = logic as (route: Route<string, any>) => string;
};

const trackViewIfNeeded = async (routeNameRef: React.MutableRefObject<string | undefined>, path?: string) => {
  const previousRouteName = routeNameRef.current;
  const route = navigationRef.getCurrentRoute();
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
  return () => trackViewIfNeeded(routeNameRef, navigationRef.getCurrentRoute()?.name);
};
