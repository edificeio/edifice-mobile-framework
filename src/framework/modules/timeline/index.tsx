import React from 'react';

import reducer, { type TimelineState } from './reducer';
import TimelineFiltersScreen from './screens/timeline-filters-screen';
import TimelineScreen from './screens/timeline-screen';
import { preferences, storage, TimelinePreferencesData, TimelineStorageData } from './storage';

import { Module } from '~/app/module';

export default new Module<
  'timeline',
  { 'timeline/home': undefined; 'timeline/filters': undefined },
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
    tabIconActive: 'ui-checkbox-on',
    tabIconInactive: 'ui-checkbox-off',
    tabOrder: 0,
    tabRoute: 'timeline/home',
    tabTestID: 'tabbar-news',
  },
  Stack => (
    <>
      <Stack.Screen name="timeline/home" component={TimelineScreen} />
      <Stack.Screen name="timeline/filters" component={TimelineFiltersScreen} />
    </>
  ),
);
