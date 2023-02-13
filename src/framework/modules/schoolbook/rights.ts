/**
 * Schoolbook workflow
 */
import { ISession } from '~/framework/modules/auth/model';
import { IResource, resourceHasRight } from '~/framework/util/resourceRights';

export const createWordSchoolbookResourceRight = 'fr.wseduc.schoolbook.controllers.SchoolBookController|createWord';
export const resendWordSchoolbookResourceRight = 'fr-wseduc-schoolbook-controllers-SchoolBookController|resend';
export const deleteWordSchoolbookResourceRight = 'fr-wseduc-schoolbook-controllers-SchoolBookController|deleteWord';

export const getSchoolbookWorkflowInformation = (session: ISession) => ({
  create: session.authorizedActions.some(a => a.name === createWordSchoolbookResourceRight),
});

export const hasResendRight = (schoolbookWordResource: IResource, session: ISession) =>
  resourceHasRight(schoolbookWordResource, resendWordSchoolbookResourceRight, session);
export const hasDeleteRight = (schoolbookWordResource: IResource, session: ISession) =>
  resourceHasRight(schoolbookWordResource, deleteWordSchoolbookResourceRight, session);
