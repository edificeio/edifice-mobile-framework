import I18n from 'i18n-js';
import * as React from 'react';

import moduleConfig from '~/framework/modules/timelinev2/moduleConfig';
import TimelineFiltersScreen, { computeNavBar } from '~/framework/modules/timelinev2/screens/TimelineFiltersScreen';
import TimelineScreen, { computeNavBar as TimelineNavBar } from '~/framework/modules/timelinev2/screens/TimelineScreen';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { ITimelineNavigationParams, timelineRouteNames } from '.';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<ITimelineNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={timelineRouteNames.Home} component={TimelineScreen} options={TimelineNavBar} initialParams={{}} />

      <Stack.Screen
        name={timelineRouteNames.Filters}
        component={TimelineFiltersScreen}
        options={{
          title: I18n.t('timeline.filtersScreen.title'),
          headerRight: () => computeNavBar(true),
        }}
        initialParams={undefined}
      />

      {/* <Stack.Screen
        name={timelineRouteNames.Dummy}
        component={() => <Text>Dummy</Text>}
        options={{
          title: 'Dummy',
        }}
      /> */}
    </>
  ));
