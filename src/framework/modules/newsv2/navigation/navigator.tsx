import * as React from 'react';

import moduleConfig from '~/framework/modules/newsv2/module-config';
import NewsDetailsScreen, { computeNavBar as detailsNavBar } from '~/framework/modules/newsv2/screens/details';
import NewsHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/newsv2/screens/home';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { NewsNavigationParams, newsRouteNames } from '.';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<NewsNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={newsRouteNames.home} component={NewsHomeScreen} options={homeNavBar} initialParams={{}} />
      <Stack.Screen name={newsRouteNames.details} component={NewsDetailsScreen} options={detailsNavBar} initialParams={{}} />
    </>
  ));
