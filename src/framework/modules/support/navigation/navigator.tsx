import * as React from 'react';

import { SupportNavigationParams, supportRouteNames } from '.';

import moduleConfig from '~/framework/modules/support/module-config';
import SupportCreateTicketScreen, { computeNavBar as supportNavBar } from '~/framework/modules/support/screens/create-ticket';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<SupportNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={supportRouteNames.home} component={SupportCreateTicketScreen} options={supportNavBar} />
    </>
  ));
