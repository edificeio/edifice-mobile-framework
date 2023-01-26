import * as React from 'react';

import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { {{moduleName | toCamelCase | capitalize}}NavigationParams, {{moduleName | toCamelCase}}RouteNames } from '.';
import moduleConfig from '../module-config';
import {{moduleName | toCamelCase | capitalize}}HomeScreen, { computeNavBar as homeNavBar } from '../screens/home';
// import {{moduleName | toCamelCase | capitalize}}OtherScreen, { computeNavBar as otherNavBar } from '../screens/other';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<{{moduleName | toCamelCase | capitalize}}NavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen
        name={{{moduleName | toCamelCase}}RouteNames.home}
        component={{{moduleName | toCamelCase | capitalize}}HomeScreen}
        options={homeNavBar}
        initialParams={{}}
      />
      {/* <Stack.Screen
        name={{{moduleName | toCamelCase}}RouteNames.other}
        component={{{moduleName | toCamelCase | capitalize}}OtherScreen}
        options={otherNavBar}
        initialParams={undefined}
      /> */}
    </>
  ));
