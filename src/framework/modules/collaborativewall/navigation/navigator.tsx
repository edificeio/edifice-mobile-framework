import * as React from 'react';

import moduleConfig from '~/framework/modules/collaborativewall/module-config';
import CollaborativewallHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/collaborativewall/screens/home';
import CollaborativewallViewerScreen, { computeNavBar as viewerNavBar } from '~/framework/modules/collaborativewall/screens/viewer';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { CollaborativewallNavigationParams, collaborativewallRouteNames } from '.';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<CollaborativewallNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen
        name={collaborativewallRouteNames.home}
        component={CollaborativewallHomeScreen}
        options={homeNavBar}
        initialParams={{}}
      />
      <Stack.Screen
        name={collaborativewallRouteNames.viewer}
        component={CollaborativewallViewerScreen}
        options={viewerNavBar}
        initialParams={{}}
      />
    </>
  ));
