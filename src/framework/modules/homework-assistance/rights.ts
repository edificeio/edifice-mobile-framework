/**
 * Homework assistance workflow
 */
import { AuthLoggedAccount } from '~/framework/modules/auth/model';

export const sendHomeworkAssistanceRequestRight = 'fr.openent.homeworkAssistance.controller.CallbackController|send';

export const getHomeworkAssistanceWorkflowInformation = (session: AuthLoggedAccount) => ({
  send: session.rights.authorizedActions.some(a => a.name === sendHomeworkAssistanceRequestRight),
});
