/**
 * Zimbra workflow
 */

import { AuthLoggedAccount } from '~/framework/modules/auth/model';

export const sendExternalZimbraMailRight = 'fr.openent.zimbra.controllers.ZimbraController|zimbraOutside';

export const getZimbraWorkflowInformation = (session: AuthLoggedAccount) => ({
  sendExternal: session.rights.authorizedActions.some(a => a.name === sendExternalZimbraMailRight),
});
