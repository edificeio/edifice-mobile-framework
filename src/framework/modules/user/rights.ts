import { ISession } from '~/framework/modules/auth/model';
export const showMottoMood = 'org.entcore.directory.controllers.UserBookController|userBookMottoMood';

export const getShowMottoMoodRight = (session: ISession): boolean => {
  return session.authorizedActions.some(a => a.name === showMottoMood);
};
