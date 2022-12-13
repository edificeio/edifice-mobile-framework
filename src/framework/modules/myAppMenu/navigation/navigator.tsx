import I18n from 'i18n-js';
import * as React from 'react';

import { createModuleNavigator } from '~/framework/navigation/MainNavigator';
import { IEntcoreApp, IEntcoreWidget, NavigableModuleArray } from '~/framework/util/moduleTool';

import { IMyAppsNavigationParams, myAppsRouteNames } from '.';
import moduleConfig from '../moduleConfig';
import MyAppsHomeScreen from '../screens/MyAppsHomeScreen';
import { myAppsModules } from '../myAppsModules';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) => {
  const modules = new NavigableModuleArray(...myAppsModules.get().filterAvailables(apps, widgets));
  const MyAppsContainer = props => <MyAppsHomeScreen {...props} modules={modules} />;
  return createModuleNavigator<IMyAppsNavigationParams>(
    moduleConfig.routeName,
    Stack => (
      <>
        <Stack.Screen
          name={myAppsRouteNames.Home}
          component={MyAppsContainer}
          options={({
            title: I18n.t('MyApplications'),
          })}
          initialParams={undefined}
        />
      </>
    ),
    Stack => null,
  );
};
