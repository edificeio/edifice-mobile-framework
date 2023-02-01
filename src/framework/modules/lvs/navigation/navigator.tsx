import * as React from 'react';

import moduleConfig from '~/framework/modules/lvs/module-config';
import LvsHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/lvs/screens/home';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { LvsNavigationParams, lvsRouteNames } from '.';

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
