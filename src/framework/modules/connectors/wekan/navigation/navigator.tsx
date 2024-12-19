import * as React from 'react';

import { WekanNavigationParams, wekanRouteNames } from '.';

import ConnectorRedirectScreen, { computeNavBar as homeNavBar } from '~/framework/modules/connectors/common/redirect-screen';
import moduleConfig from '~/framework/modules/connectors/wekan/module-config';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<WekanNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen
        name={wekanRouteNames.home}
        component={ConnectorRedirectScreen}
        options={homeNavBar}
        initialParams={{
          url: 'https://wekan.lyceeconnecte.fr',
        }}
      />
    </>
  ));
