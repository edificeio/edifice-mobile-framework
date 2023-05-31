import * as React from 'react';

import moduleConfig from '~/framework/modules/news/module-config';
import NewsDetailsScreen, { computeNavBar as NewsDetailsNavBar } from '~/framework/modules/news/screens/news-details';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { NewsNavigationParams, newsRouteNames } from '.';

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
