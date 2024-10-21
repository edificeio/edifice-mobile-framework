import * as React from 'react';

import { CollaborativewallNavigationParams, collaborativewallRouteNames } from '.';

import moduleConfig from '~/framework/modules/collaborativewall/module-config';
import CollaborativewallHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/collaborativewall/screens/home';
import CollaborativewallViewerScreen, { computeNavBar as viewerNavBar } from '~/framework/modules/collaborativewall/screens/viewer';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

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
