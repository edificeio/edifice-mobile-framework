import I18n from 'i18n-js';
import * as React from 'react';

import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { HomeworkNavigationParams, homeworkRouteNames } from '.';
import { computeNavBar as homeworkExplorerNavBar } from '../components/HomeworkExplorerScreen';
import { computeNavBar as homeworkTaskListNavBar } from '../components/HomeworkTaskListScreen';
import moduleConfig from '../module-config';
import HomeworkExplorerScreen from '../screens/HomeworkExplorerScreen';
import HomeworkInitialScreen from '../screens/HomeworkInitialScreen';
import HomeworkTaskDetailsScreen from '../screens/HomeworkTaskDetailsScreen';
import HomeworkTaskListScreen from '../screens/HomeworkTaskListScreen';

// import HomeworkOtherScreen, { computeNavBar as otherNavBar } from '../screens/other';

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
