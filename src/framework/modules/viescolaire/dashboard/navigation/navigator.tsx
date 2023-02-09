import * as React from 'react';

import moduleConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import DashboardHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/viescolaire/dashboard/screens/home';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { DashboardNavigationParams, dashboardRouteNames } from '.';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<DashboardNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={dashboardRouteNames.home} component={DashboardHomeScreen} options={homeNavBar} />
    </>
  ));
