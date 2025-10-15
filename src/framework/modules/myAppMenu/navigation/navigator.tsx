import * as React from 'react';

import { IMyAppsNavigationParams, myAppsRouteNames } from '.';

import { I18n } from '~/app/i18n';
import moduleConfig from '~/framework/modules/myAppMenu/module-config';
import { myAppsConnector, myAppsModules, myAppsSecondaryModules, myAppsWidgets } from '~/framework/modules/myAppMenu/myAppsModules';
import MyAppsHomeScreen from '~/framework/modules/myAppMenu/screens/MyAppsHomeScreen';
import MyAppMenuWidgetsScreen, { computeNavBar as widgetsNavBar } from '~/framework/modules/myAppMenu/screens/widgets';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { navBarTitle } from '~/framework/navigation/navBar';
import { AnyNavigableModule, NavigableModuleArray } from '~/framework/util/moduleTool';

export default (({ session }) => {
  const modules = new NavigableModuleArray(...myAppsModules.get().filterAvailables(session));
  const secondaryModules = new NavigableModuleArray(...myAppsSecondaryModules.get().filterAvailables(session));
  const connectors = new NavigableModuleArray(...myAppsConnector.get().filterAvailables(session));
  const widgets = new NavigableModuleArray(...myAppsWidgets.get().filterAvailables(session));
  const MyAppsContainer = props => (
    <MyAppsHomeScreen {...props} modules={modules} secondaryModules={secondaryModules} connectors={connectors} widgets={widgets} />
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
      <Stack.Screen
        name={myAppsRouteNames.widgets}
        component={MyAppMenuWidgetsScreen}
        options={widgetsNavBar}
        initialParams={{}} // @scaffolder replace `{}` by `undefined` if no navParams are defined for this screen.
      />
    </>
  ));
}) as AnyNavigableModule['getRoot'];
