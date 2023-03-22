import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '../module-config';
import type { UserHomeScreenNavParams } from '../screens/home';
import type { UserProfileScreenNavParams } from '../screens/profile';

export const userRouteNames = {
  home: `${moduleConfig.routeName}` as 'home', // keep 'Home' as Typescript type for the main screen
  profile: `${moduleConfig.routeName}/profile` as 'profile',
};
export interface UserNavigationParams extends ParamListBase {
  home: UserHomeScreenNavParams;
  profile: UserProfileScreenNavParams;
}
