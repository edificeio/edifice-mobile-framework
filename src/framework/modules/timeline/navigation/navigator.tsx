import * as React from 'react';

import { ITimelineNavigationParams, timelineRouteNames } from '.';

import moduleConfig from '~/framework/modules/timeline/module-config';
import TimelineSpaceScreen, { computeNavBar as spaceNavBar } from '~/framework/modules/timeline/screens/space';
import TimelineFiltersScreen, {
  computeNavBar as TimelineFiltersNavBar,
} from '~/framework/modules/timeline/screens/timeline-filters-screen';
import TimelineScreen, { computeNavBar as TimelineNavBar } from '~/framework/modules/timeline/screens/timeline-screen';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<ITimelineNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={timelineRouteNames.Home} component={TimelineScreen} options={TimelineNavBar} initialParams={{}} />

      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name={timelineRouteNames.Filters}
          component={TimelineFiltersScreen}
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
