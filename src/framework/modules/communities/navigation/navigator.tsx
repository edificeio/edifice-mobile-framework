import * as React from 'react';

import { CommunitiesNavigationParams, communitiesRouteNames } from '.';

import moduleConfig from '~/framework/modules/communities/module-config';
import CommunitiesListScreen, { computeNavBar as listNavBar } from '~/framework/modules/communities/screens/list';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<CommunitiesNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={communitiesRouteNames.list} component={CommunitiesListScreen} options={listNavBar} initialParams={{}} />
    </>
  ));
