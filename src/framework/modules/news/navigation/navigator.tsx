import * as React from 'react';

import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { NewsNavigationParams, newsRouteNames } from '.';
import moduleConfig from '../module-config';
import NewsDetailsScreen, { computeNavBar as NewsDetailsNavBar } from '../screens/news-details';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<NewsNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen
        name={newsRouteNames.newsDetails}
        component={NewsDetailsScreen}
        options={NewsDetailsNavBar}
        initialParams={{}}
      />
    </>
  ));
