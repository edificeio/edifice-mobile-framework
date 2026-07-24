import { AuthActiveAccount } from '~/framework/modules/auth/model';

export const showMottoMood = 'org.entcore.directory.controllers.UserBookController|userBookMottoMood';
export const switchThemeRight = 'org.entcore.directory.controllers.UserBookController|userBookSwitchTheme';

export const getShowMottoMoodRight = (session: AuthActiveAccount): boolean => {
  return session.rights.authorizedActions.some(a => a.name === showMottoMood);
};

export const getSwitchThemeRight = (session: AuthActiveAccount): boolean => {
  return session.rights.authorizedActions.some(a => a.name === switchThemeRight);
};
