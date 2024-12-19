import { AuthLoggedAccount } from '~/framework/modules/auth/model';

export const showMottoMood = 'org.entcore.directory.controllers.UserBookController|userBookMottoMood';

export const getShowMottoMoodRight = (session: AuthLoggedAccount): boolean => {
  return session.rights.authorizedActions.some(a => a.name === showMottoMood);
};
