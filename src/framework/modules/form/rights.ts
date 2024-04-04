/**
 * Form workflow
 */
import { AuthLoggedAccount } from '~/framework/modules/auth/model';

export const initFormResponseRight = 'fr.openent.formulaire.controllers.FormController|initResponseRight';

export const getFormWorkflowInformation = (session?: AuthLoggedAccount) => ({
  initResponse: session?.rights.authorizedActions.some(a => a.name === initFormResponseRight),
});
