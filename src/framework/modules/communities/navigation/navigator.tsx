import * as React from 'react';
import { Platform } from 'react-native';

import { CommunitiesNavigationParams, communitiesRouteNames } from '.';

import moduleConfig from '~/framework/modules/communities/module-config';
import CommunitiesDocumentsScreen, { computeNavBar as documentsNavBar } from '~/framework/modules/communities/screens/documents';
import CommunitiesHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/communities/screens/home';
import CommunitiesJoinConfirmScreen, {
  computeNavBar as joinConfirmNavBar,
} from '~/framework/modules/communities/screens/join-confirm';
import CommunitiesListScreen, { computeNavBar as listNavBar } from '~/framework/modules/communities/screens/list';
import CommunitiesMembersScreen, { computeNavBar as membersNavBar } from '~/framework/modules/communities/screens/members';
import { setCrossIconBlackForRoutes, setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<CommunitiesNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={communitiesRouteNames.list} component={CommunitiesListScreen} options={listNavBar} initialParams={{}} />
      <Stack.Screen name={communitiesRouteNames.home} component={CommunitiesHomeScreen} options={homeNavBar} initialParams={{}} />
      <Stack.Screen
        name={communitiesRouteNames.documents}
        component={CommunitiesDocumentsScreen}
        options={documentsNavBar}
        initialParams={{}}
      />
      <Stack.Screen
        name={communitiesRouteNames.members}
        component={CommunitiesMembersScreen}
        options={membersNavBar}
        initialParams={{}}
      />
      <Stack.Group
        screenOptions={{
          animation: 'slide_from_bottom',
          gestureDirection: 'vertical',
          presentation: Platform.select({ android: 'modal', ios: 'formSheet' }),
          sheetGrabberVisible: true,
        }}>
        <Stack.Screen
          name={communitiesRouteNames.joinConfirm}
          component={CommunitiesJoinConfirmScreen}
          options={joinConfirmNavBar}
        />
      </Stack.Group>
    </>
  ));

setModalModeForRoutes([communitiesRouteNames.joinConfirm]);
setCrossIconBlackForRoutes([communitiesRouteNames.joinConfirm]);
