import React from 'react';

import reducer, { type TimelineState } from './reducer';
import TimelineFiltersScreen, { TimelineFiltersScreenOptions } from './screens/timeline-filters-screen';
import TimelineScreen, { TimelineScreenOptions } from './screens/timeline-screen';
import { preferences, storage, TimelinePreferencesData, TimelineStorageData } from './storage';

import { Module } from '~/app/module';

export default new Module<
  'timeline',
  { 'timeline': { reloadWithNewSettings?: boolean }; 'timeline/filters': undefined },
  TimelineState,
  TimelineStorageData,
  TimelinePreferencesData
>(
  {
    apiPrefix: 'timeline',
    apiScope: ['timeline', 'userbook'],
    matchEntcoreApp: 'Timeline',
    name: 'timeline',
    preferences,
    reducer,
    storage,
    storageName: 'timeline',
    tab: {
      tabIconActive: 'ui-checkbox-on',
      tabIconInactive: 'ui-checkbox-off',
      tabOrder: 0,
      tabRoute: 'timeline',
      tabTestID: 'tabbar-news',
    },
  },
  Stack => (
    <>
      <Stack.Screen name="timeline" component={TimelineScreen} options={TimelineScreenOptions} initialParams={{}} />
      <Stack.Screen name="timeline/filters" component={TimelineFiltersScreen} options={TimelineFiltersScreenOptions} />
    </>
  ),
);
