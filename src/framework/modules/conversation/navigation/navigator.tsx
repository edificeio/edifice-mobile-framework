import * as React from 'react';

import moduleConfig from '~/framework/modules/conversation/module-config';
import ConversationMailContentScreen, {
  computeNavBar as conversationMailContentNavBar,
} from '~/framework/modules/conversation/screens/ConversationMailContent';
import ConversationMailListScreen, {
  computeNavBar as conversationMailListNavBar,
} from '~/framework/modules/conversation/screens/ConversationMailListScreen';
import ConversationNewMailScreen, {
  computeNavBar as conversationNewMailNavBar,
} from '~/framework/modules/conversation/screens/ConversationNewMail';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { ConversationNavigationParams, conversationRouteNames } from '.';

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
        name={conversationRouteNames.mailContent}
        component={ConversationMailContentScreen}
        options={conversationMailContentNavBar}
        initialParams={{}}
      />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name={conversationRouteNames.newMail}
          component={ConversationNewMailScreen}
          options={conversationNewMailNavBar}
          initialParams={{}}
        />
      </Stack.Group>
    </>
  ));

setModalModeForRoutes([conversationRouteNames.newMail]);
