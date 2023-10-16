import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/user/module-config';
import { IPushNotifsItemsListScreenNavigationParams } from '~/framework/modules/user/screens/PushNotifsItemsListScreen';
import type { IPushNotifsTopicsListScreenNavigationParams } from '~/framework/modules/user/screens/PushNotifsTopicsListScreen';
import type { UserHomeScreenNavParams } from '~/framework/modules/user/screens/home';
import type { UserLegalNoticeScreenNavParams } from '~/framework/modules/user/screens/legal-notice';
import type { ProfileScreenNavigationParams } from '~/framework/modules/user/screens/profile';
import type { UserStructuresScreenNavParams } from '~/framework/modules/user/screens/profile/structures';
import type { UserWhoAreWeScreenNavParams } from '~/framework/modules/user/screens/who-are-we';
import { UserEditHobbiesScreenNavParams } from '~/framework/modules/user/screens/profile/edit-hobbies';
import { UserEditDescriptionScreenNavParams } from '~/framework/modules/user/screens/profile/edit-description';
import { UserEditMoodMottoScreenNavParams } from '~/framework/modules/user/screens/profile/edit-moodmotto';

export const userRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  notifPrefs: `${moduleConfig.routeName}/notifPrefs` as 'notifPrefs',
  notifPrefsDetails: `${moduleConfig.routeName}/notifPrefs/details` as 'notifPrefsDetails',
  profile: `${moduleConfig.routeName}/profile` as 'profile',
  structures: `${moduleConfig.routeName}/profile/structures` as 'structures',
  editHobbies: `${moduleConfig.routeName}/profile/editHobbies` as 'editHobbies',
  editDescription: `${moduleConfig.routeName}/profile/editDescription` as 'editDescription',
  editMoodMotto: `${moduleConfig.routeName}/profile/editMoodMotto` as 'editMoodMotto',
  whoAreWe: `${moduleConfig.routeName}/who-are-we` as 'whoAreWe',
  legalNotice: `${moduleConfig.routeName}/legal-notice` as 'legalNotice',
};
export interface UserNavigationParams extends ParamListBase {
  home: UserHomeScreenNavParams;
  notifPrefs: IPushNotifsTopicsListScreenNavigationParams;
  notifPrefsDetails: IPushNotifsItemsListScreenNavigationParams;
  profile: ProfileScreenNavigationParams;
  structures: UserStructuresScreenNavParams;
  editHobbies: UserEditHobbiesScreenNavParams;
  editDescription: UserEditDescriptionScreenNavParams;
  editMoodMotto: UserEditMoodMottoScreenNavParams;
  whoAreWe: UserWhoAreWeScreenNavParams;
  legalNotice: UserLegalNoticeScreenNavParams;
}
