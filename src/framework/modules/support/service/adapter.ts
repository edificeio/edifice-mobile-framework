/**
 * From the model to the API format for the ticket created, and back.
 */
import type { TicketAttachment, TicketDraft } from '~/framework/modules/support/model';

import type { API } from './types';

/** Body that creates the ticket. Without attachments, the body has none (not an empty list). */
export const toCreateTicketBody = (draft: TicketDraft, attachments?: TicketAttachment[]): API.CreateTicketBody => ({
  attachments: attachments?.map(attachment => ({
    id: attachment.df.id,
    name: attachment.filename,
    size: attachment.df.filesize,
  })),
  category: draft.category,
  description: draft.description,
  school_id: draft.structure,
  subject: draft.subject,
});

/** Id of the ticket created: `null` if the server gives none. */
export const toTicketId = (response: Pick<API.TicketResponse, 'id'>): number | null => response.id;
