import React from 'react';

import { Action } from 'redux';

import { EntModule } from '~/app/module';

import reducer, { type TimelineState } from './reducer';
import TimelineFiltersScreen, { TimelineFiltersScreenOptions } from './screens/timeline-filters-screen';
import TimelineScreen, { TimelineScreenOptions } from './screens/timeline-screen';
import { preferences, storage, TimelinePreferencesData, TimelineStorageData } from './storage';

export default new EntModule<
  'timeline',
  { 'timeline': { reloadWithNewSettings?: boolean }; 'timeline/filters': undefined },
  TimelineState,
  Action,
  TimelineStorageData,
  TimelinePreferencesData
>(
  {
    matchEntcoreApp: 'Timeline',
    name: 'timeline',
    preferences,
    redux: { reducer },
    scope: ['timeline', 'userbook'],
    storage: { device: storage, namespace: 'timeline' },
    tab: {
      iconActive: 'home-fill',
      iconInactive: 'home-outline',
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
