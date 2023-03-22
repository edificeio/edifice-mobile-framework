import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '../module-config';
import type { UserHomeScreenNavParams } from '../screens/home';

export const userRouteNames = {
  home: `${moduleConfig.routeName}` as 'home', // keep 'Home' as Typescript type for the main screen
};
export interface UserNavigationParams extends ParamListBase {
  home: UserHomeScreenNavParams;
}
