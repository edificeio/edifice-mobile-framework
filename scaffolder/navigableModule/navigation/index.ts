import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '../moduleConfig';
import type { {{moduleName | toCamelCase | capitalize}}HomeScreenNavParams } from '../screens/home';
import type { {{moduleName | toCamelCase | capitalize}}OtherScreenNavParams } from '../screens/other';

export const {{moduleName | toCamelCase}}RouteNames = {
  Home: `${moduleConfig.routeName}` as 'Home', // keep 'Home' as Typescript type for the main screen
  Other: `${moduleConfig.routeName}/other` as 'Other', // @scaffolder Typescript must have static types for code-completion. Use PascalCase for the type
};
export interface {{moduleName | toCamelCase | capitalize}}NavigationParams extends ParamListBase {
  Home: {{moduleName | toCamelCase | capitalize}}HomeScreenNavParams;
  Other: {{moduleName | toCamelCase | capitalize}}OtherScreenNavParams;
}
