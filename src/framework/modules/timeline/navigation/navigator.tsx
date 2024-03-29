import * as React from 'react';

import moduleConfig from '~/framework/modules/timeline/module-config';
import TimelineFiltersScreen, {
  computeNavBar as TimelineFiltersNavBar,
} from '~/framework/modules/timeline/screens/timeline-filters-screen';
import TimelineScreen, { computeNavBar as TimelineNavBar } from '~/framework/modules/timeline/screens/timeline-screen';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { ITimelineNavigationParams, timelineRouteNames } from '.';

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
      </Stack.Group>
    </>
  ));

setModalModeForRoutes([timelineRouteNames.Filters]);
