import * as React from 'react';

import { EdtNavigationParams, edtRouteNames } from '.';

import moduleConfig from '~/framework/modules/viescolaire/edt/module-config';
import EdtHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/viescolaire/edt/screens/home';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<EdtNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={edtRouteNames.home} component={EdtHomeScreen} options={homeNavBar} initialParams={{}} />
    </>
  ));
