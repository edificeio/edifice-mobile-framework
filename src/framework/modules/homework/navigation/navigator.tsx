import * as React from 'react';

import { HomeworkNavigationParams, homeworkRouteNames } from '.';

import { I18n } from '~/app/i18n';
import { computeNavBar as homeworkCreateNavBar } from '~/framework/modules/homework/components/HomeworkCreateScreen';
import { computeNavBar as homeworkExplorerNavBar } from '~/framework/modules/homework/components/HomeworkExplorerScreen';
import { computeNavBar as homeworkSelectNavBar } from '~/framework/modules/homework/components/HomeworkSelectScreen';
import { computeNavBar as homeworkTaskListNavBar } from '~/framework/modules/homework/components/HomeworkTaskListScreen';
import moduleConfig from '~/framework/modules/homework/module-config';
import HomeworkCreateScreen from '~/framework/modules/homework/screens/HomeworkCreateScreen';
import HomeworkExplorerScreen from '~/framework/modules/homework/screens/HomeworkExplorerScreen';
import HomeworkInitialScreen from '~/framework/modules/homework/screens/HomeworkInitialScreen';
import HomeworkSelectScreen from '~/framework/modules/homework/screens/HomeworkSelectScreen';
import HomeworkTaskDetailsScreen from '~/framework/modules/homework/screens/HomeworkTaskDetailsScreen';
import HomeworkTaskListScreen from '~/framework/modules/homework/screens/HomeworkTaskListScreen';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { navBarTitle } from '~/framework/navigation/navBar';

export default () =>
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
        name={homeworkRouteNames.homeworkSelect}
        component={HomeworkSelectScreen}
        options={homeworkSelectNavBar}
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
        <Stack.Screen
          name={homeworkRouteNames.homeworkCreate}
          component={HomeworkCreateScreen}
          options={homeworkCreateNavBar}
          initialParams={{}}
        />
      </Stack.Group>
    </>
  ));

setModalModeForRoutes([homeworkRouteNames.homeworkCreate]);
