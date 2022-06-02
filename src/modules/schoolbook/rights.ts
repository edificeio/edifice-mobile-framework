/**
 * Schoolbook workflow
 */
import { IResource, resourceHasRight } from '~/framework/util/resourceRights';
import { IUserSession } from '~/framework/util/session';

export const createWordSchoolbookResourceRight = 'fr.wseduc.schoolbook.controllers.SchoolBookController|createWord';
export const resendWordSchoolbookResourceRight = 'fr-wseduc-schoolbook-controllers-SchoolBookController|resend';
export const deleteWordSchoolbookResourceRight = 'fr-wseduc-schoolbook-controllers-SchoolBookController|deleteWord';

export const getSchoolbookWorkflowInformation = (session: IUserSession) => ({
  create: session.user.authorizedActions.some(a => a.name === createWordSchoolbookResourceRight),
});

export const hasResendRight = (schoolbookWordResource: IResource, session: IUserSession) =>
  resourceHasRight(schoolbookWordResource, resendWordSchoolbookResourceRight, session);
export const hasDeleteRight = (schoolbookWordResource: IResource, session: IUserSession) =>
  resourceHasRight(schoolbookWordResource, deleteWordSchoolbookResourceRight, session);
