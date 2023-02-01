import * as React from 'react';

import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { LvsNavigationParams, lvsRouteNames } from '.';
import moduleConfig from '../module-config';
import LvsHomeScreen, { computeNavBar as homeNavBar } from '../screens/home';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<LvsNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen
        name={lvsRouteNames.home}
        component={LvsHomeScreen}
        options={homeNavBar}
        initialParams={{
          connector: apps[0],
        }}
      />
    </>
  ));
