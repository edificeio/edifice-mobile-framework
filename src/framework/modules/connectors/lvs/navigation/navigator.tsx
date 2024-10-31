import * as React from 'react';

import { LvsNavigationParams, lvsRouteNames } from '.';

import moduleConfig from '~/framework/modules/connectors/lvs/module-config';
import LvsHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/connectors/lvs/screens/home';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { AnyNavigableModule } from '~/framework/util/moduleTool';

export default (({ matchingApps }) =>
  createModuleNavigator<LvsNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen
        name={lvsRouteNames.home}
        component={LvsHomeScreen}
        options={homeNavBar}
        initialParams={{
          connector: matchingApps[0],
        }}
      />
    </>
  ))) as AnyNavigableModule['getRoot'];
