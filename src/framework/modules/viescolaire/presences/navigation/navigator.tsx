import * as React from 'react';

import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import PresencesCallScreen, { computeNavBar as callNavBar } from '~/framework/modules/viescolaire/presences/screens/call';
import PresencesCourseListScreen, {
  computeNavBar as courseListNavBar,
} from '~/framework/modules/viescolaire/presences/screens/course-list';
import PresencesDeclareAbsenceScreen, {
  computeNavBar as declareAbsenceNavBar,
} from '~/framework/modules/viescolaire/presences/screens/declare-absence';
import PresencesDeclareEventScreen, {
  computeNavBar as declareEventNavBar,
} from '~/framework/modules/viescolaire/presences/screens/declare-event';
import PresencesHistoryScreen, { computeNavBar as historyNavBar } from '~/framework/modules/viescolaire/presences/screens/history';
import PresencesMementoScreen, { computeNavBar as mementoNavBar } from '~/framework/modules/viescolaire/presences/screens/memento';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { PresencesNavigationParams, presencesRouteNames } from '.';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<PresencesNavigationParams>(moduleConfig.name, Stack => {
    /**
     * This module has no fixed home screen. We dynamically update `moduleConfig.routeName` to point to the "home" depending of user type.
     */

    const screens: React.ReactElement[] = [];
    const session = getSession();

    if (session?.user.type === UserType.Teacher) {
      screens.push(
        <Stack.Screen
          key={presencesRouteNames.courseList}
          name={presencesRouteNames.courseList}
          component={PresencesCourseListScreen}
          options={courseListNavBar}
          initialParams={{}}
        />,
        <Stack.Screen
          key={presencesRouteNames.call}
          name={presencesRouteNames.call}
          component={PresencesCallScreen}
          options={callNavBar}
          initialParams={{}}
        />,
        <Stack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
          <Stack.Screen
            key={presencesRouteNames.declareEvent}
            name={presencesRouteNames.declareEvent}
            component={PresencesDeclareEventScreen}
            options={declareEventNavBar}
            initialParams={{}}
          />
        </Stack.Group>,
        <Stack.Screen
          key={presencesRouteNames.memento}
          name={presencesRouteNames.memento}
          component={PresencesMementoScreen}
          options={mementoNavBar}
          initialParams={{}}
        />,
      );
      moduleConfig.routeName = presencesRouteNames.courseList;
    } else {
      screens.push(
        <Stack.Screen
          key={presencesRouteNames.history}
          name={presencesRouteNames.history}
          component={PresencesHistoryScreen}
          options={historyNavBar}
          initialParams={{}}
        />,
      );
      if (session?.user.type === UserType.Relative) {
        screens.push(
          <Stack.Screen
            key={presencesRouteNames.declareAbsence}
            name={presencesRouteNames.declareAbsence}
            component={PresencesDeclareAbsenceScreen}
            options={declareAbsenceNavBar}
            initialParams={{}}
          />,
        );
      }
      moduleConfig.routeName = presencesRouteNames.history;
    }
    return <>{screens}</>;
  });

setModalModeForRoutes([presencesRouteNames.declareEvent]);
