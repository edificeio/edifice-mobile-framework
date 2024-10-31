import * as React from 'react';

import DrawerNavigator from './drawer-navigator';

import { ZimbraNavigationParams, zimbraRouteNames } from '.';

import moduleConfig from '~/framework/modules/zimbra/module-config';
import ZimbraComposerScreen, { computeNavBar as composerNavBar } from '~/framework/modules/zimbra/screens/composer';
import ZimbraMailScreen, { computeNavBar as mailNavBar } from '~/framework/modules/zimbra/screens/mail';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<ZimbraNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={zimbraRouteNames.home} component={DrawerNavigator} options={{ headerShown: false }} />
      <Stack.Screen name={zimbraRouteNames.composer} component={ZimbraComposerScreen} options={composerNavBar} />
      <Stack.Screen name={zimbraRouteNames.mail} component={ZimbraMailScreen} options={mailNavBar} />
    </>
  ));
