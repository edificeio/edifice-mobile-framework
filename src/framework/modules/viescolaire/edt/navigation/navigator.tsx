import * as React from 'react';

import moduleConfig from '~/framework/modules/viescolaire/edt/module-config';
import EdtHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/viescolaire/edt/screens/home';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { EdtNavigationParams, edtRouteNames } from '.';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<EdtNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={edtRouteNames.home} component={EdtHomeScreen} options={homeNavBar} initialParams={{}} />
    </>
  ));
