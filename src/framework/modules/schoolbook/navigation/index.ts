import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '../module-config';

// import type { SchoolbookHomeScreenNavParams } from '../screens/home';
// import type { SchoolbookOtherScreenNavParams } from '../screens/other';

export const schoolbookRouteNames = {
  // home: `${moduleConfig.routeName}` as 'home', // keep 'Home' as Typescript type for the main screen
  // other: `${moduleConfig.routeName}/other` as 'other', // @scaffolder Typescript must have static types for code-completion. Use PascalCase for the type
};
export interface SchoolbookNavigationParams extends ParamListBase {
  // home: SchoolbookHomeScreenNavParams;
  // other: SchoolbookOtherScreenNavParams;
}
