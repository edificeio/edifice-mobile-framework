import React from 'react';

import reducer, { type TimelineState } from './reducer';
import TimelineFiltersScreen, { TimelineFiltersScreenOptions } from './screens/timeline-filters-screen';
import TimelineScreen, { TimelineScreenOptions } from './screens/timeline-screen';
import { preferences, storage, TimelinePreferencesData, TimelineStorageData } from './storage';

import { EntModule } from '~/app/module';
import { Action } from 'redux';

export default new EntModule<
  'timeline',
  { 'timeline': { reloadWithNewSettings?: boolean }; 'timeline/filters': undefined },
  TimelineState,
  Action,
  TimelineStorageData,
  TimelinePreferencesData
>(
  {
    scope: ['timeline', 'userbook'],
    matchEntcoreApp: 'Timeline',
    name: 'timeline',
    preferences,
    redux: { reducer },
    storage: { namespace: 'timeline', device: storage },
    tab: {
      iconActive: 'ui-checkbox-on',
      iconInactive: 'ui-checkbox-off',
      order: 0,
      route: 'timeline',
      testId: 'tabbar-news',
    },
  },
  Stack => (
    <>
      <Stack.Screen name="timeline" component={TimelineScreen} options={TimelineScreenOptions} initialParams={{}} />
      <Stack.Screen name="timeline/filters" component={TimelineFiltersScreen} options={TimelineFiltersScreenOptions} />
    </>
  ),
);
