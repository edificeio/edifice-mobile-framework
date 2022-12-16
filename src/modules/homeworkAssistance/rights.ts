/**
 * Homework assistance workflow
 */
import { IUserSession } from '~/framework/util/session';

export const sendHomeworkAssistanceRequestRight = 'fr.openent.homeworkAssistance.controller.CallbackController|send';

export const getHomeworkAssistanceWorkflowInformation = (session: IUserSession) => ({
  send: session.user.authorizedActions.some(a => a.name === sendHomeworkAssistanceRequestRight),
});
