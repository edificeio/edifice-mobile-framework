import I18n from 'i18n-js';
import * as React from 'react';

import { computeNavBar as homeworkExplorerNavBar } from '~/framework/modules/homework/components/HomeworkExplorerScreen';
import { computeNavBar as homeworkTaskListNavBar } from '~/framework/modules/homework/components/HomeworkTaskListScreen';
import moduleConfig from '~/framework/modules/homework/module-config';
import HomeworkExplorerScreen from '~/framework/modules/homework/screens/HomeworkExplorerScreen';
import HomeworkInitialScreen from '~/framework/modules/homework/screens/HomeworkInitialScreen';
import HomeworkTaskDetailsScreen from '~/framework/modules/homework/screens/HomeworkTaskDetailsScreen';
import HomeworkTaskListScreen from '~/framework/modules/homework/screens/HomeworkTaskListScreen';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { HomeworkNavigationParams, homeworkRouteNames } from '.';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<HomeworkNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen
        name={homeworkRouteNames.home}
        component={HomeworkInitialScreen}
        options={{ title: I18n.t('Homework') }}
        initialParams={undefined}
      />
      <Stack.Screen
        name={homeworkRouteNames.homeworkExplorer}
        component={HomeworkExplorerScreen}
        options={homeworkExplorerNavBar}
        initialParams={{}}
      />
      <Stack.Screen
        name={homeworkRouteNames.homeworkTaskDetails}
        component={HomeworkTaskDetailsScreen}
        options={{ title: I18n.t('Homework') }}
        initialParams={{}}
      />
      <Stack.Screen
        name={homeworkRouteNames.homeworkTaskList}
        component={HomeworkTaskListScreen}
        options={homeworkTaskListNavBar}
        initialParams={{}}
      />
    </>
  ));
