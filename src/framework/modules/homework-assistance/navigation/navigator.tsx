import * as React from 'react';

import moduleConfig from '~/framework/modules/homework-assistance/module-config';
import HomeworkAssistanceHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/homework-assistance/screens/home';
import HomeworkAssistanceRequestScreen, {
  computeNavBar as requestNavBar,
} from '~/framework/modules/homework-assistance/screens/request';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { HomeworkAssistanceNavigationParams, homeworkAssistanceRouteNames } from '.';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<HomeworkAssistanceNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={homeworkAssistanceRouteNames.home} component={HomeworkAssistanceHomeScreen} options={homeNavBar} />
      <Stack.Screen
        name={homeworkAssistanceRouteNames.request}
        component={HomeworkAssistanceRequestScreen}
        options={requestNavBar}
      />
    </>
  ));
