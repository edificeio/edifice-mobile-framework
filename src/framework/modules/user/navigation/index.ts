import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '../module-config';
import type { UserHomeScreenNavParams } from '../screens/home';
import type { UserNotifPrefsScreenNavParams } from '../screens/notifPrefs';
import type { UserProfileScreenNavParams } from '../screens/profile';

export const userRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  notifPrefs: `${moduleConfig.routeName}/notifPrefs` as 'notifPrefs',
  profile: `${moduleConfig.routeName}/profile` as 'profile',
};
export interface UserNavigationParams extends ParamListBase {
  home: UserHomeScreenNavParams;
  notifPrefs: UserNotifPrefsScreenNavParams;
  profile: UserProfileScreenNavParams;
}
