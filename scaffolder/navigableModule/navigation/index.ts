import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '../moduleConfig';
import type { {{moduleName | capitalize}}HomeScreenNavParams } from '../screens/home';
import type { {{moduleName | capitalize}}OtherScreenNavParams } from '../screens/other';

export const {{moduleName}}RouteNames = {
  Home: `${moduleConfig.routeName}` as 'Home', // keep 'Home' as Typescript type for the main screen
  Other: `${moduleConfig.routeName}/other` as 'Other', // @scaffolder Typescript must have static types for code-completion. Use PascalCase for the type
};
export interface {{moduleName | capitalize}}NavigationParams extends ParamListBase {
  Home: {{moduleName | capitalize}}HomeScreenNavParams;
  Other: {{moduleName | capitalize}}OtherScreenNavParams;
}
