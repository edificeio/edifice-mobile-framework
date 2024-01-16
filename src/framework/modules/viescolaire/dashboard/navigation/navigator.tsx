import * as React from 'react';

import { getSession } from '~/framework/modules/auth/reducer';
import { UserType } from '~/framework/modules/auth/service';
import moduleConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import DashboardRelativeScreen, {
  computeNavBar as relativeNavBar,
} from '~/framework/modules/viescolaire/dashboard/screens/relative';
import DashboardStudentScreen, { computeNavBar as studentNavBar } from '~/framework/modules/viescolaire/dashboard/screens/student';
import DashboardTeacherScreen, { computeNavBar as teacherNavBar } from '~/framework/modules/viescolaire/dashboard/screens/teacher';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { DashboardNavigationParams, dashboardRouteNames } from '.';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<DashboardNavigationParams>(moduleConfig.name, Stack => {
    /**
     * This module has no fixed home screen. We dynamically update `moduleConfig.routeName` to point to the "home" depending of user type.
     */

    const screens: React.ReactElement[] = [];
    const session = getSession();
    const userType = session?.user.type;

    if (userType === UserType.Student) {
      screens.push(
        <Stack.Screen
          name={dashboardRouteNames.student}
          component={DashboardStudentScreen}
          options={studentNavBar}
          initialParams={{}}
        />,
      );
      moduleConfig.routeName = dashboardRouteNames.student;
    } else if (userType === UserType.Relative) {
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
