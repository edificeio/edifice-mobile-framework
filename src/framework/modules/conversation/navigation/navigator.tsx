import * as React from 'react';

import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { ConversationNavigationParams, conversationRouteNames } from '.';
import moduleConfig from '../module-config';
// import ConversationHomeScreen, { computeNavBar as homeNavBar } from '../screens/home';
// import ConversationOtherScreen, { computeNavBar as otherNavBar } from '../screens/other';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<ConversationNavigationParams>(moduleConfig.name, Stack => (
    <>
      {/* <Stack.Screen
        name={conversationRouteNames.home}
        component={ConversationHomeScreen}
        options={homeNavBar}
        initialParams={{}}
      /> */}
      {/* <Stack.Screen
        name={conversationRouteNames.other}
        component={ConversationOtherScreen}
        options={otherNavBar}
        initialParams={{}}
      /> */}
    </>
  ));
