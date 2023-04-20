/**
 * Zimbra workflow
 */
import { ISession } from '~/framework/modules/auth/model';

export const sendExternalZimbraMailRight = 'fr.openent.zimbra.controllers.ZimbraController|zimbraOutside';

export const getZimbraWorkflowInformation = (session: ISession) => ({
  sendExternal: session.authorizedActions.some(a => a.name === sendExternalZimbraMailRight),
});
