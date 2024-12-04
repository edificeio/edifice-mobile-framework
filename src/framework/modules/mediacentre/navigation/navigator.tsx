import * as React from 'react';

import moduleConfig from '~/framework/modules/mediacentre/module-config';
import MediacentreHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/mediacentre/screens/MediacentreHomeScreen';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

import { MediacentreNavigationParams, mediacentreRouteNames } from '.';

export default () =>
  createModuleNavigator<MediacentreNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={mediacentreRouteNames.home} component={MediacentreHomeScreen} options={homeNavBar} initialParams={{}} />
    </>
  ));
