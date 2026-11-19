/**
 * What the user does in « Aide et support »: send a ticket.
 */
import type { TicketDraft } from '~/framework/modules/support/model';
import { supportService } from '~/framework/modules/support/service';
// ToDo(support-migration): `workspace` is not migrated. Its upload only calls its service (scope `workspace`, asked by `media`),
// so it works although the module is not loaded.
import workspaceService from '~/framework/modules/workspace/service';
import type { LocalFile } from '~/framework/util/fileHandler/models';
import type { AuthActiveAccount } from '~/modules/auth/model';

/**
 * Sends the ticket: its files first, to the protected folder of the workspace of the user, then the ticket with them.
 * @returns the id of the ticket. Throws if a step fails, or if the server gives no id.
 */
export const sendSupportTicket = async (session: AuthActiveAccount, draft: TicketDraft, files: LocalFile[]): Promise<number> => {
  const attachments = files.length ? await workspaceService.files.uploadFiles(session, files, { parent: 'protected' }) : undefined;
  const id = await supportService.ticket.post(session, draft, attachments);
  if (!id) throw new Error('Ticket creation failed');
  return id;
};
