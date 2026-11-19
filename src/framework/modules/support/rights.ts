/**
 * Support workflow
 */
import { AuthActiveAccount } from '~/modules/auth/model';

export const createSupportTicketRight = 'net.atos.entng.support.controllers.TicketController|createTicket';

export const getSupportWorkflowInformation = (session: AuthActiveAccount) => ({
  createTicket: session.rights.authorizedActions.some(a => a.name === createSupportTicketRight),
});
