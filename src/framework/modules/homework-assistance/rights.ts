/**
 * Homework assistance workflow
 */
import { ISession } from '~/framework/modules/auth/model';

export const sendHomeworkAssistanceRequestRight = 'fr.openent.homeworkAssistance.controller.CallbackController|send';

export const getHomeworkAssistanceWorkflowInformation = (session: ISession) => ({
  send: session.authorizedActions.some(a => a.name === sendHomeworkAssistanceRequestRight),
});
