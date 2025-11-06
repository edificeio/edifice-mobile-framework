import * as React from 'react';

import { IMyAppsNavigationParams, myAppsRouteNames } from '.';

import { I18n } from '~/app/i18n';
import moduleConfig from '~/framework/modules/myAppMenu/module-config';
import { myAppsConnector, myAppsModules, myAppsSecondaryModules } from '~/framework/modules/myAppMenu/myAppsModules';
import MyAppsHomeScreen from '~/framework/modules/myAppMenu/screens/MyAppsHomeScreen';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { navBarTitle } from '~/framework/navigation/navBar';
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
      <Stack.Screen
        name={myAppsRouteNames.Home}
        component={MyAppsContainer}
        options={{
          headerTitle: navBarTitle(I18n.get('myapp-appname')),
        }}
        initialParams={undefined}
      />
    </>
  ));
}) as AnyNavigableModule['getRoot'];
