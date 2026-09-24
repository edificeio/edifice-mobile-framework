import React from 'react';

import { Action } from 'redux';

import { EntModule } from '~/app/module';
import theme, { THEME_LEVEL } from '~/app/theme';

import TimelineScreen, { TimelineScreenOptions } from './screens/timeline-screen';

export default new EntModule<'timeline', { timeline: { reloadWithNewSettings?: boolean } }, undefined, Action>(
  {
    entTrackingName: 'Timeline',
    hasRight: () => theme.level === THEME_LEVEL.FIRST_DEGREE,
    matchEntcoreApp: 'Timeline',
    name: 'timeline',
    scope: ['timeline', 'userbook'],
    tab: {
      iconActive: 'home-fill',
      iconInactive: 'home-outline',
      order: 0,
      route: 'timeline',
      testId: 'tabbar-timeline',
    },
  },
  Stack => (
    <>
      <Stack.Screen name="timeline" component={TimelineScreen} options={TimelineScreenOptions} initialParams={{}} />
    </>
  ),
);
