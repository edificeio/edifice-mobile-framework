import * as React from 'react';

import { PresencesNavigationParams, presencesRouteNames } from '.';

import { AccountType } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import PresencesCallScreen, { computeNavBar as callNavBar } from '~/framework/modules/viescolaire/presences/screens/call';
import PresencesCallListScreen, {
  computeNavBar as callListNavBar,
} from '~/framework/modules/viescolaire/presences/screens/call-list';
import PresencesDeclareAbsenceScreen, {
  computeNavBar as declareAbsenceNavBar,
} from '~/framework/modules/viescolaire/presences/screens/declare-absence';
import PresencesDeclareEventScreen, {
  computeNavBar as declareEventNavBar,
} from '~/framework/modules/viescolaire/presences/screens/declare-event';
import PresencesEventListScreen, {
  computeNavBar as eventListNavBar,
} from '~/framework/modules/viescolaire/presences/screens/event-list';
import PresencesHistoryScreen, { computeNavBar as historyNavBar } from '~/framework/modules/viescolaire/presences/screens/history';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<PresencesNavigationParams>(moduleConfig.name, Stack => {
    /**
     * This module has no fixed home screen. We dynamically update `moduleConfig.routeName` to point to the "home" depending of user type.
     */

    const screens: React.ReactElement[] = [];
    const session = getSession();

    if (session?.user.type === AccountType.Teacher) {
      screens.push(
        <Stack.Screen
          key={presencesRouteNames.callList}
          name={presencesRouteNames.callList}
          component={PresencesCallListScreen}
          options={callListNavBar}
          initialParams={{}}
        />,
        <Stack.Screen
          key={presencesRouteNames.call}
          name={presencesRouteNames.call}
          component={PresencesCallScreen}
          options={callNavBar}
          initialParams={{}}
        />,
        <Stack.Group key={presencesRouteNames.declareEvent} screenOptions={{ presentation: 'fullScreenModal' }}>
          <Stack.Screen
            key={presencesRouteNames.declareEvent}
            name={presencesRouteNames.declareEvent}
            component={PresencesDeclareEventScreen}
            options={declareEventNavBar}
            initialParams={{}}
          />
        </Stack.Group>,
      );
      moduleConfig.routeName = presencesRouteNames.callList;
    } else {
      screens.push(
        <Stack.Screen
          key={presencesRouteNames.history}
          name={presencesRouteNames.history}
          component={PresencesHistoryScreen}
          options={historyNavBar}
          initialParams={{}}
        />,
        <Stack.Group key={presencesRouteNames.eventList} screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen
            key={presencesRouteNames.eventList}
            name={presencesRouteNames.eventList}
            component={PresencesEventListScreen}
            options={eventListNavBar}
            initialParams={{}}
          />
        </Stack.Group>,
      );
      if (session?.user.type === AccountType.Relative) {
        screens.push(
          <Stack.Group key={presencesRouteNames.declareAbsence} screenOptions={{ presentation: 'fullScreenModal' }}>
            <Stack.Screen
              key={presencesRouteNames.declareAbsence}
              name={presencesRouteNames.declareAbsence}
              component={PresencesDeclareAbsenceScreen}
              options={declareAbsenceNavBar}
              initialParams={{}}
            />
          </Stack.Group>,
        );
      }
      moduleConfig.routeName = presencesRouteNames.history;
    }
    return <>{screens}</>;
  });

setModalModeForRoutes([presencesRouteNames.declareEvent, presencesRouteNames.declareAbsence, presencesRouteNames.eventList]);
