import * as React from 'react';

import { ZimbraNavigationParams, zimbraRouteNames } from '.';

import moduleConfig from '~/framework/modules/zimbra/module-config';
import ZimbraHomeScreen from '~/framework/modules/zimbra/screens/home';
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
