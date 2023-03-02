/**
 * Homework workflow
 */
import { ISession } from '~/framework/modules/auth/model';

export const viewHomeworkResourceRight = 'fr.wseduc.homeworks.controllers.HomeworksController|view';
export const createHomeworkResourceRight = 'fr.wseduc.homeworks.controllers.HomeworksController|createHomework';

export const getHomeworkWorkflowInformation = (session: ISession) => ({
  view: session.authorizedActions.some(a => a.name === viewHomeworkResourceRight),
  create: session.authorizedActions.some(a => a.name === createHomeworkResourceRight),
});
