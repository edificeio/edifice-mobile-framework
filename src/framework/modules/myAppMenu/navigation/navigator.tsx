import I18n from 'i18n-js';
import * as React from 'react';

import { createModuleNavigator } from '~/framework/navigation/mainNavigation';
import { IEntcoreApp, IEntcoreWidget, NavigableModuleArray } from '~/framework/util/moduleTool';

import { IMyAppsNavigationParams, myAppsRouteNames } from '.';
import moduleConfig from '../moduleConfig';
import { myAppsModules } from '../myAppsModules';
import MyAppsHomeScreen from '../screens/MyAppsHomeScreen';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) => {
  const modules = new NavigableModuleArray(...myAppsModules.get().filterAvailables(apps, widgets));
  const MyAppsContainer = props => <MyAppsHomeScreen {...props} modules={modules} />;
  return createModuleNavigator<IMyAppsNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen
        name={myAppsRouteNames.Home}
        component={MyAppsContainer}
        options={{
          title: I18n.t('MyApplications'),
        }}
        initialParams={undefined}
      />
    </>
  ));
};
