import * as React from 'react';

import moduleConfig from '~/framework/modules/test-tahiti/module-config';
import TestTahitiHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/test-tahiti/screens/home';
import TestTahitiWebviewScreen, { computeNavBar as webviewNavBar } from '~/framework/modules/test-tahiti/screens/webview';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

import { TestTahitiNavigationParams, testTahitiRouteNames } from '.';

export default () =>
  createModuleNavigator<TestTahitiNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={testTahitiRouteNames.home} component={TestTahitiHomeScreen} options={homeNavBar} initialParams={{}} />
      <Stack.Screen
        name={testTahitiRouteNames.webview}
        component={TestTahitiWebviewScreen}
        options={webviewNavBar}
        initialParams={undefined}
      />
    </>
  ));
