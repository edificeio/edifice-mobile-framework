/**
 * Schoolbook workflow
 */
import { IUserSession } from '~/framework/util/session';

export const viewSchoolbookResourceRight = 'fr.wseduc.schoolbook.controllers.SchoolBookController|view';
export const createWordSchoolbookResourceRight = 'fr.wseduc.schoolbook.controllers.SchoolBookController|createWord';

export const getSchoolbookWorkflowInformation = (session: IUserSession) => ({
  view: session.user.authorizedActions.some(a => a.name === viewSchoolbookResourceRight),
  create: session.user.authorizedActions.some(a => a.name === createWordSchoolbookResourceRight),
});
