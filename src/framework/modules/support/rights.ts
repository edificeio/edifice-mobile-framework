/**
 * Support workflow
 */
import { AuthLoggedAccount } from '~/framework/modules/auth/model';

export const createSupportTicketRight = 'net.atos.entng.support.controllers.TicketController|createTicket';

export const getSupportWorkflowInformation = (session: AuthLoggedAccount) => ({
  createTicket: session.rights.authorizedActions.some(a => a.name === createSupportTicketRight),
});
