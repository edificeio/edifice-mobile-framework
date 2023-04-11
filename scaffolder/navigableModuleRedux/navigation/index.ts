import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/module-name/module-config';
import type { {{moduleName | toCamelCase | capitalize}}HomeScreenNavParams } from '~/framework/modules/module-name/screens/home';
// import type { {{moduleName | toCamelCase | capitalize}}OtherScreenNavParams } from '~/framework/modules/module-name/screens/other';

export const {{moduleName | toCamelCase}}RouteNames = {
  home: `${moduleConfig.routeName}` as 'home', // keep 'Home' as Typescript type for the main screen
  // other: `${moduleConfig.routeName}/other` as 'other', // @scaffolder Typescript must have static types for code-completion. Use PascalCase for the type
};
export interface {{moduleName | toCamelCase | capitalize}}NavigationParams extends ParamListBase {
  home: {{moduleName | toCamelCase | capitalize}}HomeScreenNavParams;
  // other: {{moduleName | toCamelCase | capitalize}}OtherScreenNavParams;
}
