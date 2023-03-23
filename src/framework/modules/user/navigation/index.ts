import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '../module-config';
import { IPushNotifsItemsListScreenNavigationParams } from '../screens/PushNotifsItemsListScreen';
import type { IPushNotifsTopicsListScreenNavigationParams } from '../screens/PushNotifsTopicsListScreen';
import type { UserFamilyScreenNavParams } from '../screens/family';
import type { UserHomeScreenNavParams } from '../screens/home';
import type { UserLegalNoticeScreenNavParams } from '../screens/legal-notice';
import type { UserProfileScreenNavParams } from '../screens/profile';
import type { UserStructuresScreenNavParams } from '../screens/structures';
import type { UserWhoAreWeScreenNavParams } from '../screens/who-are-we';

export const userRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  notifPrefs: `${moduleConfig.routeName}/notifPrefs` as 'notifPrefs',
  notifPrefsDetails: `${moduleConfig.routeName}/notifPrefs/details` as 'notifPrefsDetails',
  profile: `${moduleConfig.routeName}/profile` as 'profile',
  structures: `${moduleConfig.routeName}/structures` as 'structures',
  family: `${moduleConfig.routeName}/family` as 'family',
  whoAreWe: `${moduleConfig.routeName}/who-are-we` as 'whoAreWe',
  legalNotice: `${moduleConfig.routeName}/legal-notice` as 'legalNotice',
};
export interface UserNavigationParams extends ParamListBase {
  home: UserHomeScreenNavParams;
  notifPrefs: IPushNotifsTopicsListScreenNavigationParams;
  notifPrefsDetails: IPushNotifsItemsListScreenNavigationParams;
  profile: UserProfileScreenNavParams;
  structures: UserStructuresScreenNavParams;
  family: UserFamilyScreenNavParams;
  whoAreWe: UserWhoAreWeScreenNavParams;
  legalNotice: UserLegalNoticeScreenNavParams;
}
