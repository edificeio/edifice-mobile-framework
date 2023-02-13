import * as React from 'react';

import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { SchoolbookNavigationParams, schoolbookRouteNames } from '.';
import moduleConfig from '../module-config';

// import SchoolbookHomeScreen, { computeNavBar as homeNavBar } from '../screens/home';
// import SchoolbookOtherScreen, { computeNavBar as otherNavBar } from '../screens/other';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<SchoolbookNavigationParams>(moduleConfig.name, Stack => (
    <>
      {/* <Stack.Screen
        name={schoolbookRouteNames.home}
        component={SchoolbookHomeScreen}
        options={homeNavBar}
        initialParams={{}}
      /> */}
      {/* <Stack.Screen
        name={schoolbookRouteNames.other}
        component={SchoolbookOtherScreen}
        options={otherNavBar}
        initialParams={{}}
      /> */}
    </>
  ));
