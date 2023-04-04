import * as React from 'react';

import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { UserNavigationParams, userRouteNames } from '.';
import moduleConfig from '../module-config';
import PushNotifsItemsListScreen, { computeNavBar as pushNotifsItemsListNavBar } from '../screens/PushNotifsItemsListScreen';
import PushNotifsTopicsListScreen, { computeNavBar as pushNotifsTopicsListNavBar } from '../screens/PushNotifsTopicsListScreen';
import UserFamilyScreen, { computeNavBar as familyNavBar } from '../screens/family';
import UserHomeScreen, { computeNavBar as homeNavBar } from '../screens/home';
import UserLegalNoticeScreen, { computeNavBar as legalNoticeNavBar } from '../screens/legal-notice';
import UserProfileScreen, { computeNavBar as profileNavBar } from '../screens/profile';
import UserStructuresScreen, { computeNavBar as structuresNavBar } from '../screens/structures';
import UserWhoAreWeScreen, { computeNavBar as whoAreWeNavBar } from '../screens/who-are-we';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<UserNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={userRouteNames.home} component={UserHomeScreen} options={homeNavBar} initialParams={{}} />
      <Stack.Screen name={userRouteNames.profile} component={UserProfileScreen} options={profileNavBar} initialParams={{}} />
      <Stack.Screen
        name={userRouteNames.notifPrefs}
        component={PushNotifsTopicsListScreen}
        options={pushNotifsTopicsListNavBar}
        initialParams={{}}
      />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name={userRouteNames.notifPrefsDetails}
          component={PushNotifsItemsListScreen}
          options={pushNotifsItemsListNavBar}
          initialParams={{}}
        />
      </Stack.Group>
      <Stack.Screen
        name={userRouteNames.structures}
        component={UserStructuresScreen}
        options={structuresNavBar}
        initialParams={{}}
      />
      <Stack.Screen name={userRouteNames.family} component={UserFamilyScreen} options={familyNavBar} initialParams={{}} />
      <Stack.Screen name={userRouteNames.whoAreWe} component={UserWhoAreWeScreen} options={whoAreWeNavBar} initialParams={{}} />
      <Stack.Screen
        name={userRouteNames.legalNotice}
        component={UserLegalNoticeScreen}
        options={legalNoticeNavBar}
        initialParams={{}}
      />
    </>
  ));
