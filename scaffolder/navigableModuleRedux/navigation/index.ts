import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '../moduleConfig';

export const {{moduleName}}RouteNames = {
  Home: `${moduleConfig.routeName}` as 'Home', // keep 'Home' as Typescript type for the main screen
  Other: `${moduleConfig.routeName}/other` as 'Other', // @scaffolder Typescript must have static types for code-completion. Use PascalCase for the type
};
export interface I{{moduleName | capitalize}}NavigationParams extends ParamListBase {
  Home: { requiredFoo: string; optionalBar?: number }; // @scaffolder define here navigationParams for your screen
  Other: undefined; // @scaffolder undefined if no navigation params
}
