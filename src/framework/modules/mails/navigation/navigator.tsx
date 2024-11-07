import * as React from 'react';

import { MailsNavigationParams, mailsRouteNames } from '.';

import moduleConfig from '~/framework/modules/mails/module-config';
import MailsDetailsScreen, { computeNavBar as detailsNavBar } from '~/framework/modules/mails/screens/details/screen';
import MailsEditScreen, { computeNavBar as editNavBar } from '~/framework/modules/mails/screens/edit/screen';
import MailsListScreen, { computeNavBar as listNavBar } from '~/framework/modules/mails/screens/list/screen';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<MailsNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={mailsRouteNames.home} component={MailsListScreen} options={listNavBar} initialParams={{}} />
      <Stack.Screen name={mailsRouteNames.details} component={MailsDetailsScreen} options={detailsNavBar} initialParams={{}} />
      <Stack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
        <Stack.Screen name={mailsRouteNames.edit} component={MailsEditScreen} options={editNavBar} initialParams={{}} />
      </Stack.Group>
    </>
  ));

setModalModeForRoutes([mailsRouteNames.edit]);
