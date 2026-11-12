import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/user/module-config';
import type { UserHomeScreenNavParams } from '~/framework/modules/user/screens/home';
import type { UserLangScreenNavParams } from '~/framework/modules/user/screens/lang/types';
import type { UserLegalNoticeScreenNavParams } from '~/framework/modules/user/screens/legal-notice';
import type { ProfileScreenNavigationParams } from '~/framework/modules/user/screens/profile';
import type { UserEditDescriptionScreenNavParams } from '~/framework/modules/user/screens/profile/edit-description';
import type { UserEditHobbiesScreenNavParams } from '~/framework/modules/user/screens/profile/edit-hobbies';
import type { UserEditMoodMottoScreenNavParams } from '~/framework/modules/user/screens/profile/edit-moodmotto';
import type { UserStructuresScreenNavParams } from '~/framework/modules/user/screens/profile/structures';
import type { IPushNotifsItemsListScreenNavigationParams } from '~/framework/modules/user/screens/PushNotifsItemsListScreen';
import type { IPushNotifsTopicsListScreenNavigationParams } from '~/framework/modules/user/screens/PushNotifsTopicsListScreen';
import type { UserSentNotificationFiltersScreenNavParams } from '~/framework/modules/user/screens/sent-notification-filters/types';
import type { UserSentNotificationsScreenNavParams } from '~/framework/modules/user/screens/sent-notifications/types';
import type { UserThemeScreenNavParams } from '~/framework/modules/user/screens/theme/types';
import type { UserWhoAreWeScreenNavParams } from '~/framework/modules/user/screens/who-are-we';

export const userRouteNames = {
  changeEmail: `${moduleConfig.routeName}/change-email` as 'change-email',
  changeMobile: `${moduleConfig.routeName}/change-mobile` as 'change-mobile',
  changePassword: `${moduleConfig.routeName}/change-password` as 'change-password',
  editDescription: `${moduleConfig.routeName}/profile/editDescription` as 'editDescription',
  editHobbies: `${moduleConfig.routeName}/profile/editHobbies` as 'editHobbies',
  editMoodMotto: `${moduleConfig.routeName}/profile/editMoodMotto` as 'editMoodMotto',
  home: `${moduleConfig.routeName}` as 'home',
  lang: `${moduleConfig.routeName}/lang` as 'lang',
  legalNotice: `${moduleConfig.routeName}/legal-notice` as 'legalNotice',
  notifPrefs: `${moduleConfig.routeName}/notifPrefs` as 'notifPrefs',
  notifPrefsDetails: `${moduleConfig.routeName}/notifPrefs/details` as 'notifPrefsDetails',
  profile: `${moduleConfig.routeName}/profile` as 'profile',
  sentNotifications: `${moduleConfig.routeName}/sent-notifications` as 'sentNotifications',
  sentNotificationsFilters: `${moduleConfig.routeName}/sent-notifications/filters` as 'sentNotificationsFilters',
  structures: `${moduleConfig.routeName}/profile/structures` as 'structures',
  theme: `${moduleConfig.routeName}/theme` as 'theme',
  whoAreWe: `${moduleConfig.routeName}/who-are-we` as 'whoAreWe',
};
export interface UserNavigationParams extends ParamListBase {
  'home': UserHomeScreenNavParams;
  'notifPrefs': IPushNotifsTopicsListScreenNavigationParams;
  'notifPrefsDetails': IPushNotifsItemsListScreenNavigationParams;
  'sentNotifications': UserSentNotificationsScreenNavParams;
  'sentNotificationsFilters': UserSentNotificationFiltersScreenNavParams;
  'profile': ProfileScreenNavigationParams;
  'structures': UserStructuresScreenNavParams;
  'editHobbies': UserEditHobbiesScreenNavParams;
  'editDescription': UserEditDescriptionScreenNavParams;
  'editMoodMotto': UserEditMoodMottoScreenNavParams;
  'whoAreWe': UserWhoAreWeScreenNavParams;
  'legalNotice': UserLegalNoticeScreenNavParams;
  'lang': UserLangScreenNavParams;
  'theme': UserThemeScreenNavParams;
  'changePassword': undefined;
  'changeEmail': undefined;
  'changeMobile': undefined;
  'mfa': undefined;
  'mfa-modal': undefined;
}
