/**
 * Schoolbook workflow
 */
import { IResource, resourceHasRight } from '~/framework/util/resourceRights';
import { IUserSession } from '~/framework/util/session';

export const viewSchoolbookResourceRight = 'fr.wseduc.schoolbook.controllers.SchoolBookController|view';
export const createWordSchoolbookResourceRight = 'fr.wseduc.schoolbook.controllers.SchoolBookController|createWord';
export const resendWordSchoolbookResourceRight = 'fr-wseduc-schoolbook-controllers-SchoolBookController|resend';

export const getSchoolbookWorkflowInformation = (session: IUserSession) => ({
  view: session.user.authorizedActions.some(a => a.name === viewSchoolbookResourceRight),
  create: session.user.authorizedActions.some(a => a.name === createWordSchoolbookResourceRight),
});

export const hasResendRight = (schoolbookWordResource: IResource, session: IUserSession) =>
  resourceHasRight(schoolbookWordResource, resendWordSchoolbookResourceRight, session);
