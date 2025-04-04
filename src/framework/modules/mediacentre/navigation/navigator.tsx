import * as React from 'react';

import { MediacentreNavigationParams, mediacentreRouteNames } from '.';

import moduleConfig from '~/framework/modules/mediacentre/module-config';
import MediacentreFilterScreen, { computeNavBar as filterNavBar } from '~/framework/modules/mediacentre/screens/filter';
import MediacentreHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/mediacentre/screens/home';
import MediacentreResourceListScreen, {
  computeNavBar as resourceListNavBar,
} from '~/framework/modules/mediacentre/screens/resource-list';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<MediacentreNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={mediacentreRouteNames.home} component={MediacentreHomeScreen} options={homeNavBar} initialParams={{}} />
      <Stack.Screen
        name={mediacentreRouteNames.resourceList}
        component={MediacentreResourceListScreen}
        options={resourceListNavBar}
        initialParams={{}}
      />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name={mediacentreRouteNames.filter}
          component={MediacentreFilterScreen}
          options={filterNavBar}
          initialParams={{}}
        />
      </Stack.Group>
    </>
  ));

setModalModeForRoutes([mediacentreRouteNames.filter]);
