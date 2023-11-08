import * as React from 'react';

import moduleConfig from '~/framework/modules/scrapbook/module-config';
import ScrapbookDetailsScreen, { computeNavBar as detailsNavBar } from '~/framework/modules/scrapbook/screens/details';
import ScrapbookHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/scrapbook/screens/home';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { ScrapbookNavigationParams, scrapbookRouteNames } from '.';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<ScrapbookNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={scrapbookRouteNames.home} component={ScrapbookHomeScreen} options={homeNavBar} initialParams={{}} />
      <Stack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
        <Stack.Screen
          name={scrapbookRouteNames.details}
          component={ScrapbookDetailsScreen}
          options={detailsNavBar}
          initialParams={{}}
        />
      </Stack.Group>
    </>
  ));

setModalModeForRoutes([scrapbookRouteNames.details]);
