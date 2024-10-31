/**
 * Form workflow
 */
import { AuthActiveAccount } from '~/framework/modules/auth/model';

export const initFormResponseRight = 'fr.openent.formulaire.controllers.FormController|initResponseRight';

export const getFormWorkflowInformation = (session?: AuthActiveAccount) => ({
  initResponse: session?.rights.authorizedActions.some(a => a.name === initFormResponseRight),
});
