import * as React from 'react';

import moduleConfig from '~/framework/modules/newsv2/module-config';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { Newsv2NavigationParams, newsv2RouteNames } from '.';

// import Newsv2HomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/module-name/screens/home';
// import Newsv2OtherScreen, { computeNavBar as otherNavBar } from '~/framework/modules/module-name/screens/other';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<Newsv2NavigationParams>(moduleConfig.name, Stack => (
    <>
      {/* <Stack.Screen
        name={newsv2RouteNames.home}
        component={Newsv2HomeScreen}
        options={homeNavBar}
        initialParams={{}}
      /> */}
      {/* <Stack.Screen
        name={newsv2RouteNames.other}
        component={Newsv2OtherScreen}
        options={otherNavBar}
        initialParams={{}}
      /> */}
    </>
  ));
