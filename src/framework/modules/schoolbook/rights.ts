/**
 * Schoolbook workflow
 */
import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { IResource, resourceHasRight } from '~/framework/util/resourceRights';

export const createWordSchoolbookResourceRight = 'fr.wseduc.schoolbook.controllers.SchoolBookController|createWord';
export const resendWordSchoolbookResourceRight = 'fr-wseduc-schoolbook-controllers-SchoolBookController|resend';
export const deleteWordSchoolbookResourceRight = 'fr-wseduc-schoolbook-controllers-SchoolBookController|deleteWord';

export const getSchoolbookWorkflowInformation = (session: AuthLoggedAccount) => ({
  create: session.rights.authorizedActions.some(a => a.name === createWordSchoolbookResourceRight),
});

export const hasResendRight = (schoolbookWordResource: IResource, session: AuthLoggedAccount) =>
  resourceHasRight(schoolbookWordResource, resendWordSchoolbookResourceRight, session);
export const hasDeleteRight = (schoolbookWordResource: IResource, session: AuthLoggedAccount) =>
  resourceHasRight(schoolbookWordResource, deleteWordSchoolbookResourceRight, session);
