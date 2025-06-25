import * as React from 'react';

import { CommunitiesNavigationParams, communitiesRouteNames } from '.';

import moduleConfig from '~/framework/modules/communities/module-config';
import CommunitiesHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/communities/screens/home';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<CommunitiesNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={communitiesRouteNames.home} component={CommunitiesHomeScreen} options={homeNavBar} initialParams={{}} />
    </>
  ));
