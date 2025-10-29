import * as React from 'react';

import { ScreenTimeNavigationParams, screenTimeRouteNames } from '.';

import moduleConfig from '~/framework/modules/widgets/screen-time/module-config';
import ScreenTimeHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/widgets/screen-time/screens/home';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<ScreenTimeNavigationParams>(moduleConfig.name, Stack => (
    <>
      {<Stack.Screen name={screenTimeRouteNames.home} component={ScreenTimeHomeScreen} options={homeNavBar} initialParams={{}} />}
    </>
  ));
