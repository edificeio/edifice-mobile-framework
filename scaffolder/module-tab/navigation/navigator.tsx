import * as React from 'react';

import moduleConfig from '~/framework/modules/{{moduleName}}/module-config';
import {{moduleName | toCamelCase | capitalize}}HomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/{{moduleName}}/screens/home';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

import { {{moduleName | toCamelCase | capitalize}}NavigationParams, {{moduleName | toCamelCase}}RouteNames } from '.';

export default () =>
  createModuleNavigator<{{moduleName | toCamelCase | capitalize}}NavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen
        name={{{moduleName | toCamelCase}}RouteNames.home}
        component={{{moduleName | toCamelCase | capitalize}}HomeScreen}
        options={homeNavBar}
        initialParams={{}}
      />
    </>
  ));
