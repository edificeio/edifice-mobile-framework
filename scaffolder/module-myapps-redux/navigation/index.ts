import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/{{moduleName}}/module-config';
import type { {{moduleName | toCamelCase | capitalize}}HomeScreenNavParams } from '~/framework/modules/{{moduleName}}/screens/home';

export const {{moduleName | toCamelCase}}RouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
};
export interface {{moduleName | toCamelCase | capitalize}}NavigationParams extends ParamListBase {
  home: {{moduleName | toCamelCase | capitalize}}HomeScreenNavParams;
}
