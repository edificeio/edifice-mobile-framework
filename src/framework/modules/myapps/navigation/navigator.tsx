import * as React from 'react';

import { IMyAppsNavigationParams, myAppsRouteNames } from '.';

import moduleConfig from '~/framework/modules/myapps/module-config';
import { myAppsConnector, myAppsModules, myAppsSecondaryModules } from '~/framework/modules/myapps/myAppsModules';
import MyAppsHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/myapps/screens/myapps-home-screen';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { AnyNavigableModule, NavigableModuleArray } from '~/framework/util/moduleTool';

export default (({ session }) => {
  const modules = new NavigableModuleArray(...myAppsModules.get().filterAvailables(session));
  const secondaryModules = new NavigableModuleArray(...myAppsSecondaryModules.get().filterAvailables(session));
  const connectors = new NavigableModuleArray(...myAppsConnector.get().filterAvailables(session));
  const MyAppsContainer = props => (
    <MyAppsHomeScreen {...props} modules={modules} secondaryModules={secondaryModules} connectors={connectors} />
  );
  return createModuleNavigator<IMyAppsNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={myAppsRouteNames.Home} component={MyAppsContainer} options={homeNavBar} initialParams={undefined} />
    </>
  ));
}) as AnyNavigableModule['getRoot'];
