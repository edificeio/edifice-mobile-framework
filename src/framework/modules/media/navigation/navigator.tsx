import * as React from 'react';

import moduleConfig from '../module-config';
import FileImportScreen, { computeNavBar as FileImportNavBar } from '../screens/import-queue';

import { MediaNavigationParams, mediaRouteNames } from '.';

import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<MediaNavigationParams>(moduleConfig.name, Stack => (
    <Stack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
      <Stack.Screen name={mediaRouteNames['import-queue']} component={FileImportScreen} options={FileImportNavBar} />
    </Stack.Group>
  ));

setModalModeForRoutes([mediaRouteNames['import-queue']]);
