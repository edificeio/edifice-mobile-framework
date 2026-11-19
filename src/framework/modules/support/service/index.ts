/**
 * API of « Aide et support ». It takes and gives types of the model (see `adapter.ts`).
 * Every call is signed with the account given (`accountFetch`): the session of the screen.
 */
import type { TicketAttachment, TicketDraft } from '~/framework/modules/support/model';
import { getModuleTransport } from '~/framework/util/transport';
import type { AuthActiveAccount } from '~/modules/auth/model';

import { toCreateTicketBody, toTicketId } from './adapter';
import type { API } from './types';

// Typed with the scopes of the module (`getModuleTransport`): `/support/...`
const transport = getModuleTransport('support');

export const supportService = {
  ticket: {
    /**
     * Creates the ticket.
     * @returns its id, or `null` if the server gives none.
     */
    post: async (session: AuthActiveAccount, draft: TicketDraft, attachments?: TicketAttachment[]) => {
      const response = await transport.accountFetch.json<API.TicketResponse>(session, '/support/ticket', {
        body: JSON.stringify(toCreateTicketBody(draft, attachments)),
        method: 'POST',
      });
      return toTicketId(response);
    },
  },
};
