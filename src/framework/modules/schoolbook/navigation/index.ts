import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/schoolbook/module-config';
import type { SchoolbookWordDetailsScreenNavigationParams } from '~/framework/modules/schoolbook/screens/SchoolbookWordDetailsScreen';
import type { SchoolbookWordReportScreenNavigationParams } from '~/framework/modules/schoolbook/screens/word-report/types';

export const schoolbookRouteNames = {
  details: `${moduleConfig.routeName}/details` as 'details',
  home: `${moduleConfig.routeName}` as 'home',
  report: `${moduleConfig.routeName}/report` as 'report',
};
export interface SchoolbookNavigationParams extends ParamListBase {
  details: SchoolbookWordDetailsScreenNavigationParams;
  report: SchoolbookWordReportScreenNavigationParams;
}
