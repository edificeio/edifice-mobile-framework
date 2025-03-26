import * as React from 'react';

import { homeNavBar } from '../screens/home/screen';

import { WikiNavigationParams, wikiRouteNames } from '.';

import moduleConfig from '~/framework/modules/wiki/module-config';
import WikiHomeScreen from '~/framework/modules/wiki/screens/home';
import WikiSummaryScreen, { computeNavBar as summaryNavBar } from '~/framework/modules/wiki/screens/summary';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<WikiNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={wikiRouteNames.home} component={WikiHomeScreen} options={homeNavBar} initialParams={{}} />
      <Stack.Screen name={wikiRouteNames.summary} component={WikiSummaryScreen} options={summaryNavBar} initialParams={{}} />
    </>
  ));
