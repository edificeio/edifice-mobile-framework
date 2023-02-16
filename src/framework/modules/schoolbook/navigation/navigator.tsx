import * as React from 'react';

import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { SchoolbookNavigationParams, schoolbookRouteNames } from '.';
import moduleConfig from '../module-config';
import SchoolbookWordDetailsScreen, { computeNavBar as SchoolbookWordDetailsNavBar } from '../screens/SchoolbookWordDetailsScreen';
import SchoolbookWordListScreen, { computeNavBar as SchoolbookWordListNavBar } from '../screens/SchoolbookWordListScreen';
import SchoolbookWordReportScreen, { computeNavBar as SchoolbookWordReportNavBar } from '../screens/schoolbook-word-report/screen';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<SchoolbookNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen
        name={schoolbookRouteNames.home}
        component={SchoolbookWordListScreen}
        options={SchoolbookWordListNavBar}
        initialParams={{}}
      />
      <Stack.Screen
        name={schoolbookRouteNames.details}
        component={SchoolbookWordDetailsScreen}
        options={SchoolbookWordDetailsNavBar}
        initialParams={{}}
      />
      <Stack.Screen
        name={schoolbookRouteNames.report}
        component={SchoolbookWordReportScreen}
        options={SchoolbookWordReportNavBar}
        initialParams={{}}
      />
    </>
  ));
