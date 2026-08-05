import React from 'react';

import { Action } from 'redux';

import { EntModule } from '~/app/module';
import theme from '~/app/theme';

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
    hasRight: () => theme.level === '2D',
    matchEntcoreApp: 'Timeline',
    name: 'home',
    scope: ['timeline', 'userbook'],
    tab: {
      iconActive: 'home-fill',
      iconInactive: 'home-outline',
      order: 0,
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
