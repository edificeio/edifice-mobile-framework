import I18n from 'i18n-js';
import * as React from 'react';

import { navigate } from '~/framework/navigation/helper';
import { createModuleNavigator } from '~/framework/navigation/mainNavigation';
import { NavBarAction } from '~/framework/navigation/navBar';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { {{moduleName | capitalize}}NavigationParams, {{moduleName}}RouteNames } from '.';
import moduleConfig from '../moduleConfig';
import {{moduleName | capitalize}}HomeScreen from '../screens/home';
import {{moduleName | capitalize}}OtherScreen, { computeNavBar } from '../screens/other';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<{{moduleName | capitalize}}NavigationParams>(moduleConfig.routeName, Stack => (
    <>
      <Stack.Screen
        name={{{moduleName}}RouteNames.Home}
        component={{{moduleName | capitalize}}HomeScreen}
        options={{
          title: I18n.t('{{moduleName}}.appName'),
          headerLeft: () => (
            // @scaffolding let's create a button in the navBar
            <NavBarAction
              iconName="ui-filter"
              onPress={() => {
                navigate({{moduleName}}RouteNames.Other);
              }}
            />
          ),
        }}
        initialParams={{}}
      />
      <Stack.Screen
        name={{{moduleName}}RouteNames.Other}
        component={{{moduleName | capitalize}}OtherScreen}
        options={{
          title: I18n.t('{{moduleName}}.otherScreen.title'),
          ...computeNavBar(true) // @scaffolding this navBar is dynamic, we implet it within the screen file
        }}
        initialParams={undefined}
      />
    </>
  ));
