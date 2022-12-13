import I18n from 'i18n-js';
import * as React from 'react';

import { createModuleNavigator } from '~/framework/navigation/MainNavigator';
import { navigate } from '~/framework/navigation/helper';
import { NavBarAction } from '~/framework/navigation/navBar';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { I{{moduleName | capitalize}}NavigationParams, {{moduleName}}RouteNames } from '.';
import moduleConfig from '../moduleConfig';
import {{moduleName | capitalize}}HomeScreen from '../screens/{{moduleName | capitalize}}HomeScreen';
import {{moduleName | capitalize}}OtherScreen, { computeNavBar } from '../screens/{{moduleName | capitalize}}OtherScreen';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<I{{moduleName | capitalize}}NavigationParams>(
    moduleConfig.routeName,
    Stack => (
      <>
        <Stack.Screen
          name={{{moduleName}}RouteNames.Home}
          component={{{moduleName | capitalize}}HomeScreen}
          options={{
            title: I18n.t('{{moduleName}}.appName'),
            headerLeft: () => ( // @scaffolding let's create a button in the navBar
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
      </>
    ),
    Stack => (
      <>
        <Stack.Screen
          name={{{moduleName}}RouteNames.Other}
          component={{{moduleName | capitalize}}OtherScreen}
          options={{
            title: I18n.t('{{moduleName}}.otherScreen.title'),
            headerRight: () => (
              computeNavBar(true) // @scaffolding this navBar is dynamic, we implet it within the screen file
            ),
          }}
          initialParams={{}}
        />
      </>
    ),
  );
