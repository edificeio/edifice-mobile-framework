import * as React from 'react';

import { MediaNavigationParams, mediaRouteNames } from '.';

import moduleConfig from '~/framework/modules/media/module-config';
import FileImportScreen, { computeNavBar as FileImportNavBar } from '~/framework/modules/media/screens/import-queue';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<MediaNavigationParams>(moduleConfig.name, Stack => (
    <Stack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
      <Stack.Screen name={mediaRouteNames['import-queue']} component={FileImportScreen} options={FileImportNavBar} />
    </Stack.Group>
  ));

setModalModeForRoutes([mediaRouteNames['import-queue']]);
