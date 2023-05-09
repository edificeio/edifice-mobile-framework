import * as React from 'react';

import { navigationRef } from '~/framework/navigation/helper';

import { Trackers } from '.';

const trackViewIfNeeded = async (routeNameRef: React.MutableRefObject<string | undefined>, path?: string) => {
  const previousRouteName = routeNameRef.current;
  const currentRouteName = navigationRef.getCurrentRoute()?.name;

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
