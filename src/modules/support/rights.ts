/**
 * Support workflow
 */
import { IUserSession } from '~/framework/util/session';

export const createSupportTicketRight = 'net.atos.entng.support.controllers.TicketController|createTicket';

export const getSupportWorkflowInformation = (session: IUserSession) => ({
  createTicket: session.user.authorizedActions.some(a => a.name === createSupportTicketRight),
});
