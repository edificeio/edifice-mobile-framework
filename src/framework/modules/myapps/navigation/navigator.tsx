import * as React from 'react';

import { IMyAppsNavigationParams, myAppsRouteNames } from '.';

import moduleConfig from '~/framework/modules/myapps/module-config';
import MyAppsHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/myapps/screens/myapps-home-screen';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () => {
  const MyAppsContainer = props => <MyAppsHomeScreen {...props} />;
  return createModuleNavigator<IMyAppsNavigationParams>(moduleConfig.name, Stack => (
    <Stack.Screen name={myAppsRouteNames.Home} component={MyAppsContainer} options={homeNavBar} initialParams={undefined} />
  ));
};
