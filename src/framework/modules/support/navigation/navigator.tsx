import * as React from 'react';

import SupportCreateTicketScreen, { computeNavBar as supportNavBar } from '~/framework/modules/support/screens/create-ticket';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { SupportNavigationParams, supportRouteNames } from '.';
import moduleConfig from '../module-config';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<SupportNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen
        name={supportRouteNames.home}
        component={SupportCreateTicketScreen}
        options={supportNavBar}
        initialParams={undefined}
      />
    </>
  ));
