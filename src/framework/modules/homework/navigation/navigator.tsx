import * as React from 'react';

import { I18n } from '~/app/i18n';
import { computeNavBar as homeworkExplorerNavBar } from '~/framework/modules/homework/components/HomeworkExplorerScreen';
import { computeNavBar as homeworkTaskListNavBar } from '~/framework/modules/homework/components/HomeworkTaskListScreen';
import moduleConfig from '~/framework/modules/homework/module-config';
import HomeworkCreateScreen from '~/framework/modules/homework/screens/HomeworkCreateScreen';
import HomeworkExplorerScreen from '~/framework/modules/homework/screens/HomeworkExplorerScreen';
import HomeworkInitialScreen from '~/framework/modules/homework/screens/HomeworkInitialScreen';
import HomeworkTaskDetailsScreen from '~/framework/modules/homework/screens/HomeworkTaskDetailsScreen';
import HomeworkTaskListScreen from '~/framework/modules/homework/screens/HomeworkTaskListScreen';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { navBarTitle } from '~/framework/navigation/navBar';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { HomeworkNavigationParams, homeworkRouteNames } from '.';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<HomeworkNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen name={homeworkRouteNames.home} component={HomeworkInitialScreen} options={{}} initialParams={undefined} />
      <Stack.Screen
        name={homeworkRouteNames.homeworkExplorer}
        component={HomeworkExplorerScreen}
        options={homeworkExplorerNavBar}
        initialParams={{}}
      />
      <Stack.Screen
        name={homeworkRouteNames.homeworkTaskDetails}
        component={HomeworkTaskDetailsScreen}
        options={{ headerTitle: navBarTitle(I18n.get('homework')) }}
        initialParams={{}}
      />
      <Stack.Screen
        name={homeworkRouteNames.homeworkTaskList}
        component={HomeworkTaskListScreen}
        options={homeworkTaskListNavBar}
        initialParams={{}}
      />

      <Stack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
        <Stack.Screen name={homeworkRouteNames.homeworkCreate} component={HomeworkCreateScreen} />
      </Stack.Group>
    </>
  ));
