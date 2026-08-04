import React from 'react';

import { Action } from 'redux';

import { EntModule } from '~/app/module';

import HomeScreen, { HomeScreenOptions } from './screens';

export default new EntModule<
  'home',
  {
    home: undefined;
  },
  undefined,
  Action
>(
  {
    entTrackingName: 'Timeline',
    matchEntcoreApp: 'Timeline',
    name: 'home',
    scope: ['timeline', 'userbook'],
    tab: {
      iconActive: 'home-fill',
      iconInactive: 'home-outline',
      order: 0.5,
      route: 'home',
      testId: 'tabbar-timeline',
    },
  },
  Stack => (
    <>
      <Stack.Screen name="home" component={HomeScreen} options={HomeScreenOptions} />
    </>
  ),
);
