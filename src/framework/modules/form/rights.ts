/**
 * Form workflow
 */
import { ISession } from '~/framework/modules/auth/model';

export const initFormResponseRight = 'fr.openent.formulaire.controllers.FormController|initResponseRight';

export const getFormWorkflowInformation = (session?: ISession) => ({
  initResponse: session?.authorizedActions.some(a => a.name === initFormResponseRight),
});
