import moment from 'moment';

import { AccountType } from '~/modules/auth/model';
import { createActiveAccount } from '~/test-utils/auth-accounts';

import {
  computeCanComment,
  countComments,
  createBlogPostResourceRight,
  getBlogPostRight,
  getBlogWorkflowInformation,
  getCommentsThread,
  getPublishableBlogs,
  hasPermissionManager,
  publishBlogPostResourceRight,
  submitBlogPostResourceRight,
} from './business';

import type { Blog, BlogPost, BlogPostComment } from '.';

const session = createActiveAccount({ id: 'me' });

/** A blog of someone else, shared with the user with the rights given. */
const createBlog = (rights: string[] = [], overrides: Partial<Blog> = {}): Blog => ({
  'allowReplies': true,
  'author': { login: 'author', userId: 'author', username: 'Author' },
  'comment-type': 'IMMEDIATE',
  'created': moment(0),
  'id': 'blog',
  'modified': moment(0),
  'publish-type': 'RESTRAINT',
  'rights': [],
  'shared': [{ groupId: '', userId: 'me', ...Object.fromEntries(rights.map(right => [right, true])) }],
  'title': 'Blog',
  'visibility': 'OWNER',
  ...overrides,
});

describe('getBlogPostRight', () => {
  it('publishes with the right to publish', () => {
    expect(getBlogPostRight(createBlog([publishBlogPostResourceRight, submitBlogPostResourceRight]), session)).toEqual({
      actionRight: publishBlogPostResourceRight,
      displayRight: publishBlogPostResourceRight,
    });
  });

  it('submits with the right to submit, shown as published in a blog `IMMEDIATE`', () => {
    expect(getBlogPostRight(createBlog([submitBlogPostResourceRight], { 'publish-type': 'IMMEDIATE' }), session)).toEqual({
      actionRight: submitBlogPostResourceRight,
      displayRight: publishBlogPostResourceRight,
    });
  });

  it('submits with the right to submit, shown as submitted in a blog `RESTRAINT`', () => {
    expect(getBlogPostRight(createBlog([submitBlogPostResourceRight]), session)).toEqual({
      actionRight: submitBlogPostResourceRight,
      displayRight: submitBlogPostResourceRight,
    });
  });

  it('creates a draft with the right to create only', () => {
    expect(getBlogPostRight(createBlog([createBlogPostResourceRight]), session)).toEqual({
      actionRight: createBlogPostResourceRight,
      displayRight: createBlogPostResourceRight,
    });
  });

  it('gives nothing without right', () => {
    expect(getBlogPostRight(createBlog(), session)).toBeUndefined();
  });

  it('gives every right to the author of the blog', () => {
    const blog = createBlog([], { author: { login: 'me', userId: 'me', username: 'Me' }, shared: [] });
    expect(getBlogPostRight(blog, session)?.actionRight).toBe(publishBlogPostResourceRight);
  });
});

describe('hasPermissionManager', () => {
  it('manages the blogs he wrote', () => {
    expect(hasPermissionManager(createBlog([], { author: { login: 'me', userId: 'me', username: 'Me' } }), session)).toBe(true);
  });

  it('manages the blogs he can delete', () => {
    expect(hasPermissionManager(createBlog(['org-entcore-blog-controllers-BlogController|delete']), session)).toBe(true);
  });

  it("doesn't manage the others", () => {
    expect(hasPermissionManager(createBlog([publishBlogPostResourceRight]), session)).toBe(false);
  });
});

describe('getBlogWorkflowInformation', () => {
  it('reads the workflow rights of the session', () => {
    const withRights = {
      ...session,
      rights: { ...session.rights, authorizedActions: [{ name: 'org.entcore.blog.controllers.BlogController|create' }] },
    } as typeof session;
    expect(getBlogWorkflowInformation(withRights).blog.create).toBe(true);
    expect(getBlogWorkflowInformation(withRights).blog.publish).toBe(false);
    expect(getBlogWorkflowInformation(session).blog.create).toBe(false);
  });
});

describe('getPublishableBlogs', () => {
  it('keeps the blogs where he can create a post, out of the trash', () => {
    const publishable = createBlog([createBlogPostResourceRight], { id: 'publishable' });
    const trashed = createBlog([createBlogPostResourceRight], { id: 'trashed', trashed: true });
    const readOnly = createBlog([], { id: 'read-only' });
    expect(getPublishableBlogs(session, [publishable, trashed, readOnly]).map(blog => blog.id)).toEqual(['publishable']);
  });
});

describe('countComments', () => {
  const comment = (deleted?: boolean) => ({
    author: { login: 'a', userId: 'a', username: 'A' },
    comment: 'Hello',
    created: moment(0),
    deleted,
    id: 'c',
    state: 'PUBLISHED',
  });

  it('counts the comments, the deleted ones apart', () => {
    expect(countComments({ comments: [comment(), comment(true), comment(false)] } as BlogPost)).toBe(2);
  });

  it('gives 0 without comments', () => {
    expect(countComments({} as BlogPost)).toBe(0);
  });
});

describe('computeCanComment', () => {
  it('lets the creator of the blog comment', () => {
    expect(computeCanComment({ rights: ['creator:me'] }, session)).toBe(true);
  });

  it('lets comment a user given the right, by himself or by a group', () => {
    const sessionInGroup = { ...session, user: { ...session.user, groups: ['group'] } } as typeof session;
    expect(computeCanComment({ rights: ['user:me:comment'] }, session)).toBe(true);
    expect(computeCanComment({ rights: ['group:group:comment'] }, sessionInGroup)).toBe(true);
  });

  it("doesn't let comment with other rights, or the rights of others", () => {
    const sessionInGroup = { ...session, user: { ...session.user, groups: ['group'] } } as typeof session;
    expect(
      computeCanComment(
        { rights: ['user:me:read', 'manager', 'creator:other', 'user:other:comment', 'group:other:comment'] },
        sessionInGroup,
      ),
    ).toBe(false);
  });
});

describe('getCommentsThread', () => {
  const author = (userId: string) => ({ login: userId, userId, username: userId.toUpperCase() });
  const comment = (id: string, seconds: number, overrides: Partial<BlogPostComment> = {}): BlogPostComment => ({
    author: author('a'),
    comment: id,
    created: moment(seconds * 1000),
    id,
    state: 'PUBLISHED',
    ...overrides,
  });

  it('gives the comments, the most recent first, each with its replies, the oldest first', () => {
    const thread = getCommentsThread(
      [
        comment('old', 1),
        comment('reply-late', 5, { replyTo: 'old' }),
        comment('recent', 2),
        comment('reply-early', 3, { replyTo: 'old' }),
      ],
      {},
    );
    expect(thread.map(c => c.id)).toEqual(['recent', 'old']);
    expect(thread[1].replies.map(r => ('id' in r ? r.id : undefined))).toEqual(['reply-early', 'reply-late']);
    expect(thread[0].replies).toEqual([]);
  });

  it('gives the author and the content, with the type of account of the author, a guest if unknown', () => {
    const [known, unknown] = getCommentsThread(
      [comment('known', 2, { author: author('teacher') }), comment('unknown', 1, { author: author('nobody') })],
      { teacher: AccountType.Teacher },
    );
    expect(known).toMatchObject({
      authorAccountType: AccountType.Teacher,
      authorId: 'teacher',
      authorName: 'TEACHER',
      content: 'known',
      isRichContent: false,
    });
    expect(known.date.epochMilliseconds).toBe(2000);
    expect(unknown).toMatchObject({ authorAccountType: AccountType.Guest });
  });

  it('keeps a deleted comment with its replies, without its author nor its content', () => {
    const [deleted] = getCommentsThread(
      [comment('deleted', 1, { deleted: true }), comment('reply', 2, { replyTo: 'deleted' })],
      {},
    );
    expect(deleted).toEqual({
      date: expect.anything(),
      deleted: true,
      id: 'deleted',
      replies: [expect.objectContaining({ id: 'reply' })],
    });
  });

  it('leaves out a reply to a comment not given', () => {
    expect(getCommentsThread([comment('reply', 1, { replyTo: 'missing' })], {})).toEqual([]);
  });
});
