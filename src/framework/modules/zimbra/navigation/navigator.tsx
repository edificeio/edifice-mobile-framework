import * as React from 'react';

import ZimbraHomeScreen from '../screens/home';

import { ZimbraNavigationParams, zimbraRouteNames } from '.';

import moduleConfig from '~/framework/modules/zimbra/module-config';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<ZimbraNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={zimbraRouteNames.home} component={ZimbraHomeScreen} />
    </>
  ));

/*export default () =>
  createModuleNavigator<ZimbraNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={zimbraRouteNames.home} component={DrawerNavigator} options={{ headerShown: false }} />
      <Stack.Screen name={zimbraRouteNames.composer} component={ZimbraComposerScreen} options={composerNavBar} />
      <Stack.Screen name={zimbraRouteNames.mail} component={ZimbraMailScreen} options={mailNavBar} />
    </>
  ));*/
