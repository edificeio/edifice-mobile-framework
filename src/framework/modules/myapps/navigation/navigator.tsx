import * as React from 'react';

import { IMyAppsNavigationParams, myAppsRouteNames } from '.';

import moduleConfig from '~/framework/modules/myapps/module-config';
import MyAppsHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/myapps/screens/myapps-home-screen';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

const createMyAppsNavigator = () =>
  createModuleNavigator<IMyAppsNavigationParams>(moduleConfig.name, Stack => (
    <Stack.Screen name={myAppsRouteNames.Home} component={MyAppsHomeScreen} options={homeNavBar} />
  ));

export default createMyAppsNavigator;
