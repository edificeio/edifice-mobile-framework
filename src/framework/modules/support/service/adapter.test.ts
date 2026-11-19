import type { TicketDraft } from '~/framework/modules/support/model';

import { toCreateTicketBody, toTicketId } from './adapter';

const draft: TicketDraft = { category: '/blog', description: 'It fails', structure: 'structure-1', subject: 'Blog' };

describe('toCreateTicketBody', () => {
  it('gives the body of the ticket, in the order the server always got it', () => {
    const attachments = [
      { df: { filesize: 12, id: 'doc-1' }, filename: 'a.png' },
      { df: { id: 'doc-2' }, filename: 'b.pdf' },
    ];
    expect(JSON.stringify(toCreateTicketBody(draft, attachments))).toBe(
      '{"attachments":[{"id":"doc-1","name":"a.png","size":12},{"id":"doc-2","name":"b.pdf"}],' +
        '"category":"/blog","description":"It fails","school_id":"structure-1","subject":"Blog"}',
    );
  });

  it('has no attachments without attachments', () => {
    expect(JSON.stringify(toCreateTicketBody(draft))).toBe(
      '{"category":"/blog","description":"It fails","school_id":"structure-1","subject":"Blog"}',
    );
  });
});

describe('toTicketId', () => {
  it('gives the id of the ticket, or null', () => {
    expect(toTicketId({ id: 42 })).toBe(42);
    expect(toTicketId({ id: null })).toBeNull();
  });
});
