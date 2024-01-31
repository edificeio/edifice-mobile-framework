/**
 * Support workflow
 */
import { ISession } from '~/framework/modules/auth/model';

export const createSupportTicketRight = 'net.atos.entng.support.controllers.TicketController|createTicket';

export const getSupportWorkflowInformation = (session: ISession) => ({
  createTicket: session.authorizedActions.some(a => a.name === createSupportTicketRight),
});
