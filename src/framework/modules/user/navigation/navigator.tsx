import * as React from 'react';

import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { UserNavigationParams, userRouteNames } from '.';
import moduleConfig from '../module-config';
import UserHomeScreen, { computeNavBar as homeNavBar } from '../screens/home';
import UserNotifPrefsScreen, { computeNavBar as notifPrefsNavBar } from '../screens/notif-prefs';
import UserProfileScreen, { computeNavBar as profileNavBar } from '../screens/profile';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<UserNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={userRouteNames.home} component={UserHomeScreen} options={homeNavBar} initialParams={{}} />
      <Stack.Screen name={userRouteNames.profile} component={UserProfileScreen} options={profileNavBar} initialParams={{}} />
      <Stack.Screen
        name={userRouteNames.notifPrefs}
        component={UserNotifPrefsScreen}
        options={notifPrefsNavBar}
        initialParams={{}}
      />
    </>
  ));
