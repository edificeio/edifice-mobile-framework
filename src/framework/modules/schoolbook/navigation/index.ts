import { ParamListBase } from '@react-navigation/native';



import moduleConfig from '~/framework/modules/schoolbook/module-config';
import type { SchoolbookWordDetailsScreenNavigationParams } from '~/framework/modules/schoolbook/screens/SchoolbookWordDetailsScreen';
import { SchoolbookWordReportScreenNavigationParams } from '~/framework/modules/schoolbook/screens/word-report/types';


export const schoolbookRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  details: `${moduleConfig.routeName}/details` as 'details',
  report: `${moduleConfig.routeName}/report` as 'report',
};
export interface SchoolbookNavigationParams extends ParamListBase {
  details: SchoolbookWordDetailsScreenNavigationParams;
  report: SchoolbookWordReportScreenNavigationParams;
}