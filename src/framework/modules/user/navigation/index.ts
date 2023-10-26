import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/user/module-config';
import { IPushNotifsItemsListScreenNavigationParams } from '~/framework/modules/user/screens/PushNotifsItemsListScreen';
import type { IPushNotifsTopicsListScreenNavigationParams } from '~/framework/modules/user/screens/PushNotifsTopicsListScreen';
import type { UserAccountOnboardingScreenNavParams } from '~/framework/modules/user/screens/account-onboarding';
import type { UserHomeScreenNavParams } from '~/framework/modules/user/screens/home';
import { UserLangScreenNavParams } from '~/framework/modules/user/screens/lang/types';
import type { UserLegalNoticeScreenNavParams } from '~/framework/modules/user/screens/legal-notice';
import type { ProfileScreenNavigationParams } from '~/framework/modules/user/screens/profile';
import { UserEditDescriptionScreenNavParams } from '~/framework/modules/user/screens/profile/edit-description';
import { UserEditHobbiesScreenNavParams } from '~/framework/modules/user/screens/profile/edit-hobbies';
import { UserEditMoodMottoScreenNavParams } from '~/framework/modules/user/screens/profile/edit-moodmotto';
import type { UserStructuresScreenNavParams } from '~/framework/modules/user/screens/profile/structures';
import type { UserWhoAreWeScreenNavParams } from '~/framework/modules/user/screens/who-are-we';

export const userRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  notifPrefs: `${moduleConfig.routeName}/notifPrefs` as 'notifPrefs',
  notifPrefsDetails: `${moduleConfig.routeName}/notifPrefs/details` as 'notifPrefsDetails',
  profile: `${moduleConfig.routeName}/profile` as 'profile',
  structures: `${moduleConfig.routeName}/profile/structures` as 'structures',
  accountOnboarding: `${moduleConfig.routeName}/accountOnboarding` as 'accountOnboarding',
  editHobbies: `${moduleConfig.routeName}/profile/editHobbies` as 'editHobbies',
  editDescription: `${moduleConfig.routeName}/profile/editDescription` as 'editDescription',
  editMoodMotto: `${moduleConfig.routeName}/profile/editMoodMotto` as 'editMoodMotto',
  whoAreWe: `${moduleConfig.routeName}/who-are-we` as 'whoAreWe',
  legalNotice: `${moduleConfig.routeName}/legal-notice` as 'legalNotice',
  lang: `${moduleConfig.routeName}/lang` as 'lang',
};
export interface UserNavigationParams extends ParamListBase {
  home: UserHomeScreenNavParams;
  notifPrefs: IPushNotifsTopicsListScreenNavigationParams;
  notifPrefsDetails: IPushNotifsItemsListScreenNavigationParams;
  profile: ProfileScreenNavigationParams;
  structures: UserStructuresScreenNavParams;
  accountOnboarding: UserAccountOnboardingScreenNavParams;
  editHobbies: UserEditHobbiesScreenNavParams;
  editDescription: UserEditDescriptionScreenNavParams;
  editMoodMotto: UserEditMoodMottoScreenNavParams;
  whoAreWe: UserWhoAreWeScreenNavParams;
  legalNotice: UserLegalNoticeScreenNavParams;
  lang: UserLangScreenNavParams;
}
