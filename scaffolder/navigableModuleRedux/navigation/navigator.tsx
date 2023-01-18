import I18n from 'i18n-js';
import * as React from 'react';

import { navigate } from '~/framework/navigation/helper';
import { createModuleNavigator } from '~/framework/navigation/mainNavigation';
import { NavBarAction } from '~/framework/navigation/navBar';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { {{moduleName | toCamelCase | capitalize}}NavigationParams, {{moduleName | toCamelCase}}RouteNames } from '.';
import moduleConfig from '../moduleConfig';
import {{moduleName | toCamelCase | capitalize}}HomeScreen from '../screens/home';
import {{moduleName | toCamelCase | capitalize}}OtherScreen, { computeNavBar } from '../screens/other';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<{{moduleName | toCamelCase | capitalize}}NavigationParams>(moduleConfig.routeName, Stack => (
    <>
      <Stack.Screen
        name={{{moduleName | toCamelCase}}RouteNames.Home}
        component={{{moduleName | toCamelCase | capitalize}}HomeScreen}
        options={{
          title: I18n.t('{{moduleName | toCamelCase}}.appName'),
          headerLeft: () => (
            // @scaffolding let's create a button in the navBar
            <NavBarAction
              iconName="ui-filter"
              onPress={() => {
                navigate({{moduleName | toCamelCase}}RouteNames.Other);
              }}
            />
          ),
        }}
        initialParams={{}}
      />
      <Stack.Screen
        name={{{moduleName | toCamelCase}}RouteNames.Other}
        component={{{moduleName | toCamelCase | capitalize}}OtherScreen}
        options={{
          title: I18n.t('{{moduleName | toCamelCase}}.otherScreen.title'),
          ...computeNavBar(true), // @scaffolding this navBar is dynamic, we implet it within the screen file
        }}
        initialParams={undefined}
      />
    </>
  ));
