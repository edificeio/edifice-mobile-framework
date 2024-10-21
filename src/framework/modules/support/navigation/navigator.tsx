import * as React from 'react';

import { SupportNavigationParams, supportRouteNames } from '.';

import moduleConfig from '~/framework/modules/support/module-config';
import SupportCreateTicketScreen, { computeNavBar as supportNavBar } from '~/framework/modules/support/screens/create-ticket';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<SupportNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={supportRouteNames.home} component={SupportCreateTicketScreen} options={supportNavBar} />
    </>
  ));
