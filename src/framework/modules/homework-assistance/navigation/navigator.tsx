import * as React from 'react';

import { HomeworkAssistanceNavigationParams, homeworkAssistanceRouteNames } from '.';

import moduleConfig from '~/framework/modules/homework-assistance/module-config';
import HomeworkAssistanceHomeScreen, { computeNavBar as homeNavBar } from '~/framework/modules/homework-assistance/screens/home';
import HomeworkAssistanceRequestScreen, {
  computeNavBar as requestNavBar,
} from '~/framework/modules/homework-assistance/screens/request';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';

export default () =>
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
