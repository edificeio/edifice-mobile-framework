import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '../module-config';
import type { UserHomeScreenNavParams } from '../screens/home';
import type { UserNotifPrefsScreenNavParams } from '../screens/notif-prefs';
import type { UserProfileScreenNavParams } from '../screens/profile';
import type { UserStructuresScreenNavParams } from '../screens/structures';

export const userRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  notifPrefs: `${moduleConfig.routeName}/notifPrefs` as 'notifPrefs',
  profile: `${moduleConfig.routeName}/profile` as 'profile',
  structures: `${moduleConfig.routeName}/structures` as 'structures',
};
export interface UserNavigationParams extends ParamListBase {
  home: UserHomeScreenNavParams;
  notifPrefs: UserNotifPrefsScreenNavParams;
  profile: UserProfileScreenNavParams;
  structures: UserStructuresScreenNavParams;
}
