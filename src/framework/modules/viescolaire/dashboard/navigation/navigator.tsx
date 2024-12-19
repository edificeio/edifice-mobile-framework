import * as React from 'react';

import { DashboardNavigationParams, dashboardRouteNames } from '.';

import { AccountType } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import moduleConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import DashboardRelativeScreen, {
  computeNavBar as relativeNavBar,
} from '~/framework/modules/viescolaire/dashboard/screens/relative';
import DashboardStudentScreen, { computeNavBar as studentNavBar } from '~/framework/modules/viescolaire/dashboard/screens/student';
import DashboardTeacherScreen, { computeNavBar as teacherNavBar } from '~/framework/modules/viescolaire/dashboard/screens/teacher';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
  createModuleNavigator<DashboardNavigationParams>(moduleConfig.name, Stack => {
    /**
     * This module has no fixed home screen. We dynamically update `moduleConfig.routeName` to point to the "home" depending of user type.
     */

    const screens: React.ReactElement[] = [];
    const session = getSession();
    const userType = session?.user.type;

    if (userType === AccountType.Student) {
      screens.push(
        <Stack.Screen
          name={dashboardRouteNames.student}
          component={DashboardStudentScreen}
          options={studentNavBar}
          initialParams={{}}
        />,
      );
      moduleConfig.routeName = dashboardRouteNames.student;
    } else if (userType === AccountType.Relative) {
      screens.push(
        <Stack.Screen
          name={dashboardRouteNames.relative}
          component={DashboardRelativeScreen}
          options={relativeNavBar}
          initialParams={{}}
        />,
      );
      moduleConfig.routeName = dashboardRouteNames.relative;
    } else {
      screens.push(
        <Stack.Screen
          name={dashboardRouteNames.teacher}
          component={DashboardTeacherScreen}
          options={teacherNavBar}
          initialParams={{}}
        />,
      );
      moduleConfig.routeName = dashboardRouteNames.teacher;
    }
    return <>{screens}</>;
  });
