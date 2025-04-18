import * as React from 'react';

import { MediacentreNavigationParams, mediacentreRouteNames } from '.';

import moduleConfig from '~/framework/modules/mediacentre/module-config';
import MediacentreHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/mediacentre/screens/MediacentreHomeScreen';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<MediacentreNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={mediacentreRouteNames.home} component={MediacentreHomeScreen} options={homeNavBar} initialParams={{}} />
    </>
  ));
