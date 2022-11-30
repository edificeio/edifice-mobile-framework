/**
 * Homework workflow
 */
import { IUserSession } from '~/framework/util/session';

export const viewHomeworkResourceRight = 'fr.wseduc.homeworks.controllers.HomeworksController|view';
export const createHomeworkResourceRight = 'fr.wseduc.homeworks.controllers.HomeworksController|createHomework';

export const getHomeworkWorkflowInformation = (session: IUserSession) => ({
  view: session.user.authorizedActions.some(a => a.name === viewHomeworkResourceRight),
  create: session.user.authorizedActions.some(a => a.name === createHomeworkResourceRight),
});
