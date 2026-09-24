import React from 'react';

import { Action } from 'redux';

import { EntModule } from '~/app/module';
import theme, { THEME_LEVEL } from '~/app/theme';

import reducer, { type TimelineState } from './reducer';
import { HomeScreen, HomeScreenOptions } from './screens/home';
import { preferences, storage, TimelinePreferencesData, TimelineStorageData } from './storage';

export default new EntModule<
  'home',
  {
    home: undefined;
  },
  TimelineState,
  Action,
  TimelineStorageData,
  TimelinePreferencesData
>(
  {
    entTrackingName: 'Timeline',
    hasRight: () => theme.level === THEME_LEVEL.SECOND_DEGREE,
    matchEntcoreApp: 'Timeline',
    name: 'home',
    preferences,
    redux: { reducer },
    scope: ['timeline', 'userbook'],
    // Todo: rename the namespace, and the Timeline* types above along with timeline deletion.
    // It is kept as is so the data already stored on the devices is still found where it lies.
    storage: { device: storage, namespace: 'timeline' },
    tab: {
      iconActive: 'home-fill',
      iconInactive: 'home-outline',
      order: 0,
      route: 'home',
      testId: 'tabbar-timeline',
    },
  },
  Stack => <Stack.Screen name="home" component={HomeScreen} options={HomeScreenOptions} />,
);
