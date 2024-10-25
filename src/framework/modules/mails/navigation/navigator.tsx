import * as React from 'react';

import { MailsNavigationParams, mailsRouteNames } from '.';

import moduleConfig from '~/framework/modules/mails/module-config';
import MailsListScreen, { computeNavBar as listNavBar } from '~/framework/modules/mails/screens/list/screen';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<MailsNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={mailsRouteNames.home} component={MailsListScreen} options={listNavBar} initialParams={{}} />
    </>
  ));
