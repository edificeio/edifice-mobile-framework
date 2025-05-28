import * as React from 'react';

import { WikiNavigationParams, wikiRouteNames } from '.';

import WikiCreateScreen, { computeNavBar as createNavBar } from '~/framework/modules/wiki//screens/create';
import moduleConfig from '~/framework/modules/wiki/module-config';
import WikiHomeScreen from '~/framework/modules/wiki/screens/home';
import { homeNavBar } from '~/framework/modules/wiki/screens/home/screen';
import WikiReaderScreen, { computeNavBar as readerNavBar } from '~/framework/modules/wiki/screens/reader';
import WikiSummaryScreen, { computeNavBar as summaryNavBar } from '~/framework/modules/wiki/screens/summary';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<WikiNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={wikiRouteNames.home} component={WikiHomeScreen} options={homeNavBar} initialParams={{}} />
      <Stack.Screen name={wikiRouteNames.summary} component={WikiSummaryScreen} options={summaryNavBar} initialParams={{}} />
      <Stack.Screen name={wikiRouteNames.reader} component={WikiReaderScreen} options={readerNavBar} initialParams={{}} />
      <Stack.Group screenOptions={{ presentation: 'containedModal' }}>
        <Stack.Screen name={wikiRouteNames.create} component={WikiCreateScreen} options={createNavBar} initialParams={{}} />
      </Stack.Group>
    </>
  ));

setModalModeForRoutes([wikiRouteNames.create]);
