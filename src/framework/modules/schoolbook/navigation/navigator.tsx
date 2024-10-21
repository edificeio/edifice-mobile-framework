import * as React from 'react';

import { SchoolbookNavigationParams, schoolbookRouteNames } from '.';

import moduleConfig from '~/framework/modules/schoolbook/module-config';
import SchoolbookWordDetailsScreen, {
  computeNavBar as schoolbookWordDetailsNavBar,
} from '~/framework/modules/schoolbook/screens/SchoolbookWordDetailsScreen';
import SchoolbookWordListScreen, {
  computeNavBar as schoolbookWordListNavBar,
} from '~/framework/modules/schoolbook/screens/SchoolbookWordListScreen';
import SchoolbookWordReportScreen, {
  computeNavBar as schoolbookWordReportNavBar,
} from '~/framework/modules/schoolbook/screens/word-report/screen';
import { createModuleNavigator } from '~/framework/navigation/moduleScreens';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

export default (apps: IEntcoreApp[], widgets: IEntcoreWidget[]) =>
  createModuleNavigator<SchoolbookNavigationParams>(moduleConfig.name, Stack => (
    <>
      <Stack.Screen
        name={schoolbookRouteNames.home}
        component={SchoolbookWordListScreen}
        options={schoolbookWordListNavBar}
        initialParams={{}}
      />
      <Stack.Screen
        name={schoolbookRouteNames.details}
        component={SchoolbookWordDetailsScreen}
        options={schoolbookWordDetailsNavBar}
        initialParams={{}}
      />
      <Stack.Screen
        name={schoolbookRouteNames.report}
        component={SchoolbookWordReportScreen}
        options={schoolbookWordReportNavBar}
        initialParams={{}}
      />
    </>
  ));
