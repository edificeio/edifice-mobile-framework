import { Temporal } from '@js-temporal/polyfill';

import { wikiService } from '~/framework/modules/wiki/service';
import { createActiveAccount } from '~/test-utils/auth-accounts';

import { loadWiki, postWikiPageComment } from './actions';
import type { WikiPage, WikiWithPageNodes } from './model';
import { wikiActionTypes } from './store';

// The service signs its requests with the session: replaced here (it needs the native side)
jest.mock('~/framework/modules/wiki/service', () => ({
  wikiService: { page: { get: jest.fn(), postComment: jest.fn() }, wiki: { get: jest.fn() } },
}));
const getWiki = jest.mocked(wikiService.wiki.get);
const getPage = jest.mocked(wikiService.page.get);
const postComment = jest.mocked(wikiService.page.postComment);

const session = createActiveAccount({ id: 'session' });
const getState = jest.fn();

const wiki: WikiWithPageNodes = {
  assetId: 'wiki-1',
  createdAt: Temporal.Instant.from('2026-01-01T10:00:00Z'),
  creatorName: 'Owner',
  name: 'Wiki',
  pages: [
    { childrenIds: [], id: 'visible', isVisible: true, position: 2, title: 'Visible' },
    { childrenIds: [], id: 'hidden', isVisible: false, position: 1, title: 'Hidden' },
  ],
  rights: ['read'],
};
const page = { id: 'p1' } as WikiPage;

describe('loadWiki', () => {
  beforeEach(() => jest.resetAllMocks());

  it('puts the wiki in the store with its pages as the user sees them', async () => {
    getWiki.mockResolvedValue(wiki);
    const dispatch = jest.fn();
    const loaded = await loadWiki(session, 'wiki-1')(dispatch, getState, undefined);
    expect(getWiki).toHaveBeenCalledWith(session, 'wiki-1');
    expect(loaded.pages.map(p => [p.id, p.depth])).toEqual([['visible', 0]]);
    expect(dispatch).toHaveBeenCalledWith({ data: loaded, type: wikiActionTypes.wikiLoaded });
  });
});

describe('postWikiPageComment', () => {
  beforeEach(() => jest.resetAllMocks());

  it('posts the comment, loads the page again, and gives the id of the comment', async () => {
    postComment.mockResolvedValue('c9');
    getPage.mockResolvedValue(page);
    // The thunk of the page is dispatched: run it with the same dispatch
    const dispatch = jest.fn(action => (typeof action === 'function' ? action(dispatch, getState, undefined) : action));
    await expect(postWikiPageComment(session, 'wiki-1', 'p1', 'Hello', 'c1')(dispatch, getState, undefined)).resolves.toBe('c9');
    expect(postComment).toHaveBeenCalledWith(session, 'wiki-1', 'p1', 'Hello', 'c1');
    expect(getPage).toHaveBeenCalledWith(session, 'wiki-1', 'p1');
    expect(dispatch).toHaveBeenCalledWith({ data: page, type: wikiActionTypes.pageLoaded });
  });

  it('does not load the page when the comment cannot be posted', async () => {
    postComment.mockRejectedValue(new Error('down'));
    const dispatch = jest.fn();
    await expect(postWikiPageComment(session, 'wiki-1', 'p1', 'Hello')(dispatch, getState, undefined)).rejects.toThrow('down');
    expect(getPage).not.toHaveBeenCalled();
  });
});
