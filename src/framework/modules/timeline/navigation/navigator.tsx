import * as React from 'react';

import { ITimelineNavigationParams, timelineRouteNames } from '.';

import moduleConfig from '~/framework/modules/timeline/module-config';
import TimelineSpaceScreen, { computeNavBar as spaceNavBar } from '~/framework/modules/timeline/screens/space';
import NotificationFiltersScreen, {
  NotificationFiltersScreenOptions as TimelineFiltersNavBar,
} from '~/framework/modules/home/screens/notification-filters';
import TimelineScreen, { TimelineScreenOptions } from '~/framework/modules/timeline/screens/timeline-screen';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<ITimelineNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={timelineRouteNames.Home} component={TimelineScreen} options={TimelineScreenOptions} initialParams={{}} />

      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name={timelineRouteNames.Filters}
          component={NotificationFiltersScreen}
          options={TimelineFiltersNavBar}
          initialParams={undefined}
        />
        <Stack.Screen
          name={timelineRouteNames.space}
          component={TimelineSpaceScreen}
          options={spaceNavBar}
          initialParams={undefined}
        />
      </Stack.Group>
    </>
  ));

setModalModeForRoutes([timelineRouteNames.Filters, timelineRouteNames.space]);
