import * as React from 'react';

import moduleConfig from '~/framework/modules/schoolbook/module-config';
import SchoolbookWordDetailsScreen, {
  computeNavBar as SchoolbookWordDetailsNavBar,
} from '~/framework/modules/schoolbook/screens/SchoolbookWordDetailsScreen';
import SchoolbookWordListScreen, {
  computeNavBar as SchoolbookWordListNavBar,
} from '~/framework/modules/schoolbook/screens/SchoolbookWordListScreen';
import SchoolbookWordReportScreen, {
  computeNavBar as SchoolbookWordReportNavBar,
} from '~/framework/modules/schoolbook/screens/word-report/screen';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import { SchoolbookNavigationParams, schoolbookRouteNames } from '.';

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
