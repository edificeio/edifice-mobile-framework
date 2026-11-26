import { Temporal } from '@js-temporal/polyfill';

import { AccountType } from '~/modules/auth/model';

import {
  getCommentAuthorIds,
  toAccountType,
  toCommentId,
  toEditCommentBody,
  toPostCommentBody,
  toWikiPage,
  toWikiWithPageNodes,
} from './adapter';
import type { API } from './types';

const wikiResponse = {
  _id: 'wiki-1',
  created: { $date: '2026-01-01T10:00:00Z' },
  description: 'A wiki',
  index: 'p1',
  modified: { $date: '2026-02-01T10:00:00Z' },
  owner: { displayName: 'Owner', userId: 'owner-1' },
  pages: [
    {
      _id: 'p1',
      author: 'owner-1',
      authorName: 'Owner',
      children: [
        { _id: 'p3', isVisible: true, position: 3, title: 'P3' },
        { _id: 'p2', isVisible: false, position: 2, title: 'P2' },
      ],
      contentPlain: '',
      isVisible: true,
      lastContributer: 'owner-1',
      lastContributerName: 'Owner',
      modified: { $date: '2026-02-01T10:00:00Z' },
      parentId: null,
      position: 1,
      title: 'P1',
    },
    {
      _id: 'p2',
      author: 'owner-1',
      authorName: 'Owner',
      contentPlain: '',
      isVisible: false,
      lastContributer: 'owner-1',
      lastContributerName: 'Owner',
      modified: { $date: '2026-02-01T10:00:00Z' },
      parentId: 'p1',
      position: 2,
      title: 'P2',
    },
  ],
  rights: ['user:u1:read'],
  thumbnail: '/workspace/document/thumb',
  title: 'Wiki',
} satisfies API.Wiki.ListPagesResponse;

describe('toWikiWithPageNodes', () => {
  it('gives the wiki, its rights, and its pages as the server sends them, children by position', () => {
    const wiki = toWikiWithPageNodes(wikiResponse, ['read']);
    expect(wiki).toEqual({
      assetId: 'wiki-1',
      createdAt: Temporal.Instant.from('2026-01-01T10:00:00Z'),
      creatorId: 'owner-1',
      creatorName: 'Owner',
      description: 'A wiki',
      name: 'Wiki',
      pages: [
        { childrenIds: ['p2', 'p3'], id: 'p1', isVisible: true, parentId: undefined, position: 1, title: 'P1' },
        { childrenIds: [], id: 'p2', isVisible: false, parentId: 'p1', position: 2, title: 'P2' },
      ],
      rights: ['read'],
      thumbnail: '/workspace/document/thumb',
      updatedAt: Temporal.Instant.from('2026-02-01T10:00:00Z'),
    });
  });

  it('takes the modification date as creation date when the server gives none', () => {
    const { created: _created, ...withoutCreated } = wikiResponse;
    expect(toWikiWithPageNodes(withoutCreated, []).createdAt).toEqual(Temporal.Instant.from('2026-02-01T10:00:00Z'));
  });
});

const comment = (id: string, date: string, author = 'a1'): API.Wiki.GetPageComment => ({
  _id: id,
  author,
  authorName: `Name ${author}`,
  comment: `Comment ${id}`,
  created: { $date: date },
});

const pageResponse: API.Wiki.GetPageResponse = {
  _id: 'p1',
  author: 'owner-1',
  authorName: 'Owner',
  comments: [
    comment('c1', '2026-03-01T10:00:00Z'),
    comment('c2', '2026-03-02T10:00:00Z', 'a2'),
    { ...comment('r2', '2026-03-04T10:00:00Z', 'a2'), replyTo: 'c1' },
    { ...comment('r1', '2026-03-03T10:00:00Z', 'a3'), replyTo: 'c1' },
    { _id: 'c3', created: { $date: '2026-03-05T10:00:00Z' }, deleted: true },
  ],
  content: '<p>Content</p>',
  contentVersion: 1,
  isVisible: true,
  jsonContent: { content: [], type: 'doc' },
  lastContributer: 'u2',
  lastContributerName: 'Updater',
  modified: { $date: '2026-02-01T10:00:00Z' },
  parentId: null,
  position: 1,
  title: 'P1',
};

describe('getCommentAuthorIds', () => {
  it('gives each author of a comment or a reply once, deleted ones apart', () => {
    expect(getCommentAuthorIds(pageResponse.comments)).toEqual(['a1', 'a2', 'a3']);
    expect(getCommentAuthorIds(undefined)).toEqual([]);
  });
});

describe('toAccountType', () => {
  it('gives the account type of the user, or nothing when not found', () => {
    expect(toAccountType({ result: [{ type: ['Teacher'] }], status: 'ok' })).toBe(AccountType.Teacher);
    expect(toAccountType({ result: [], status: 'ok' })).toBeUndefined();
  });
});

describe('toWikiPage', () => {
  const page = toWikiPage(pageResponse, { a1: AccountType.Teacher, a2: AccountType.Student, a3: undefined });

  it('gives the page, its author and its last contributor', () => {
    expect(page).toMatchObject({
      content: '<p>Content</p>',
      contentVersion: 1,
      createdAt: Temporal.Instant.from('2026-02-01T10:00:00Z'),
      creatorId: 'owner-1',
      creatorName: 'Owner',
      id: 'p1',
      isVisible: true,
      title: 'P1',
      updatedAt: Temporal.Instant.from('2026-02-01T10:00:00Z'),
      updaterId: 'u2',
      updaterName: 'Updater',
    });
  });

  it('gives the comments the newest first, each with its replies the oldest first', () => {
    expect(page.comments.map(item => [item.id, item.replies.map(reply => ('id' in reply ? reply.id : undefined))])).toEqual([
      ['c3', []],
      ['c2', []],
      ['c1', ['r1', 'r2']],
    ]);
  });

  it('gives the authors with their account type, a guest when unknown, and nothing for a deleted comment', () => {
    const [deleted, , first] = page.comments;
    expect(deleted).toEqual({ date: Temporal.Instant.from('2026-03-05T10:00:00Z'), deleted: true, id: 'c3', replies: [] });
    expect(first).toMatchObject({
      authorAccountType: AccountType.Teacher,
      authorId: 'a1',
      content: 'Comment c1',
      isRichContent: false,
    });
    expect(first.replies[0]).toMatchObject({ authorAccountType: AccountType.Guest, authorId: 'a3' });
  });
});

describe('bodies of the comments', () => {
  it('are the ones the server always got', () => {
    expect(JSON.stringify(toPostCommentBody('Hello'))).toBe('{"comment":"Hello"}');
    expect(JSON.stringify(toPostCommentBody('Hello', 'c1'))).toBe('{"comment":"Hello","replyTo":"c1"}');
    expect(JSON.stringify(toEditCommentBody('Changed'))).toBe('{"comment":"Changed"}');
  });

  it('give the id of a comment posted', () => {
    expect(toCommentId({ _id: 'c9' })).toBe('c9');
  });
});
