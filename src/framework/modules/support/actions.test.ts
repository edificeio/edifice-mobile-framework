import type { TicketDraft } from '~/framework/modules/support/model';
import { supportService } from '~/framework/modules/support/service';
import workspaceService from '~/framework/modules/workspace/service';
import type { LocalFile } from '~/framework/util/fileHandler/models';
import { createActiveAccount } from '~/test-utils/auth-accounts';

import { sendSupportTicket } from './actions';

// Both sign their requests with the session: replaced here (they need the native side)
jest.mock('~/framework/modules/support/service', () => ({ supportService: { ticket: { post: jest.fn() } } }));
jest.mock('~/framework/modules/workspace/service', () => ({ __esModule: true, default: { files: { uploadFiles: jest.fn() } } }));
const post = jest.mocked(supportService.ticket.post);
const uploadFiles = jest.mocked(workspaceService.files.uploadFiles);

const session = createActiveAccount({ id: 'session' });
const draft: TicketDraft = { category: '/blog', description: 'It fails', structure: 'structure-1', subject: 'Blog' };
const file = { filename: 'a.png' } as LocalFile;
const uploaded = [{ df: { id: 'doc-1' }, filename: 'a.png' }] as Awaited<ReturnType<typeof uploadFiles>>;

describe('sendSupportTicket', () => {
  beforeEach(() => jest.resetAllMocks());

  it('sends the ticket without files', async () => {
    post.mockResolvedValue(42);
    await expect(sendSupportTicket(session, draft, [])).resolves.toBe(42);
    expect(uploadFiles).not.toHaveBeenCalled();
    expect(post).toHaveBeenCalledWith(session, draft, undefined);
  });

  it('sends the files to the protected folder of the workspace, then the ticket with them', async () => {
    uploadFiles.mockResolvedValue(uploaded);
    post.mockResolvedValue(42);
    await expect(sendSupportTicket(session, draft, [file])).resolves.toBe(42);
    expect(uploadFiles).toHaveBeenCalledWith(session, [file], { parent: 'protected' });
    expect(post).toHaveBeenCalledWith(session, draft, uploaded);
  });

  it('throws when the server gives no id', async () => {
    post.mockResolvedValue(null);
    await expect(sendSupportTicket(session, draft, [])).rejects.toThrow('Ticket creation failed');
  });

  it('does not send the ticket when the files cannot be sent', async () => {
    uploadFiles.mockRejectedValue(new Error('down'));
    await expect(sendSupportTicket(session, draft, [file])).rejects.toThrow('down');
    expect(post).not.toHaveBeenCalled();
  });
});
