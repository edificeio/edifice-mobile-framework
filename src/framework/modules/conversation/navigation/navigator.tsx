import * as React from 'react';

import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { ConversationNavigationParams, conversationRouteNames } from '.';
import moduleConfig from '../module-config';
import ConversationMailListScreen, { computeNavBar as conversationMailListNavBar } from '../screens/ConversationMailListScreen';
import ConversationNewMailScreen, { computeNavBar as conversationNewMailNavBar } from '../screens/NewMail';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<ConversationNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen
        name={conversationRouteNames.home}
        component={ConversationMailListScreen}
        options={conversationMailListNavBar}
        initialParams={{}}
      />
      <Stack.Screen
        name={conversationRouteNames.newMail}
        component={ConversationNewMailScreen}
        options={conversationNewMailNavBar}
        initialParams={{}}
      />
    </>
  ));
