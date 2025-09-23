import * as React from 'react';

import { CantineNavigationParams, cantineRouteNames } from '.';

import moduleConfig from '~/framework/modules/widgets/cantine/module-config';
import CantineHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/widgets/cantine/screens/home';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<CantineNavigationParams>(moduleConfig.name, Stack => (
    <>{<Stack.Screen name={cantineRouteNames.home} component={CantineHomeScreen} options={homeNavBar} initialParams={{}} />}</>
  ));
