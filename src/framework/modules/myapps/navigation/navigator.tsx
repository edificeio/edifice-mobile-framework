import * as React from 'react';

import moduleConfig from '~/framework/modules/myapps/module-config';
import { IMyAppsNavigationParams, myAppsRouteNames } from '~/framework/modules/myapps/navigation';
import MyAppsHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/myapps/screens/myapps-home-screen';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<IMyAppsNavigationParams>(moduleConfig.name, Stack => (
    <Stack.Screen name={myAppsRouteNames.Home} component={MyAppsHomeScreen} options={homeNavBar} />
  ));
