import * as React from 'react';

import { NabookNavigationParams, nabookRouteNames } from '.';

import moduleConfig from '~/framework/modules/nabook/module-config';
import NabookHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/nabook/screens/home';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<NabookNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={nabookRouteNames.home} component={NabookHomeScreen} options={homeNavBar} initialParams={{}} />
    </>
  ));
