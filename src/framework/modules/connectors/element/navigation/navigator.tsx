import * as React from 'react';

import { ElementNavigationParams, elementRouteNames } from '.';

import ConnectorRedirectScreen, { computeNavBar as homeNavBar } from '~/framework/modules/connectors/common/redirect-screen';
import moduleConfig from '~/framework/modules/connectors/element/module-config';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<ElementNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen
        name={elementRouteNames.home}
        component={ConnectorRedirectScreen}
        options={homeNavBar}
        initialParams={{
          url: 'https://riot.lyceeconnecte.fr',
        }}
      />
    </>
  ));
