import moment from 'moment';
import { applyMiddleware, combineReducers, legacy_createStore } from 'redux';
import { thunk } from 'redux-thunk';

import { staleOrSplice } from '~/framework/components/list/paginated-list';
import type { Blog, BlogPost } from '~/framework/modules/blog/model';
import {
  createBlogPostResourceRight,
  publishBlogPostResourceRight,
  submitBlogPostResourceRight,
} from '~/framework/modules/blog/model/business';
import { blogService } from '~/framework/modules/blog/service';
import reducer from '~/framework/modules/blog/store';
import { audienceService } from '~/modules/audience/service';
import { AccountType } from '~/modules/auth/model';
import { createActiveAccount } from '~/test-utils/auth-accounts';

import { deleteBlogPost, editBlogPost, loadBlogPostDetails, loadPostsPage, sendBlogPost } from './actions';

// The services sign their requests with the session: replaced here (they need the native side)
jest.mock('~/framework/modules/blog/service', () => ({
  blogService: {
    accountTypes: jest.fn(),
    comments: { get: jest.fn() },
    post: { create: jest.fn(), delete: jest.fn(), edit: jest.fn(), get: jest.fn(), publish: jest.fn(), submit: jest.fn() },
    posts: { page: jest.fn(), total: jest.fn() },
  },
}));
// The pages of a list (`staleOrSplice`) come with the list component, which needs the native side: the page replaces them here
jest.mock('~/framework/components/list/paginated-list', () => ({
  staleOrSplice: jest.fn(),
}));
jest.mock('~/modules/audience/service', () => ({
  audienceService: { reaction: { getSummary: jest.fn() }, view: { getSummary: jest.fn() } },
}));
const service = jest.mocked(blogService);
const audience = jest.mocked(audienceService);

const session = createActiveAccount({ id: 'me' });

/** A blog of someone else, shared with the user with the rights given. */
const createBlog = (rights: string[]): Blog => ({
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
});

const post: BlogPost = {
  _id: 'post',
  author: { login: 'me', userId: 'me', username: 'Me' },
  content: '<p>Content</p>',
  created: moment(0),
  modified: moment(0),
  pinned: false,
  state: 'PUBLISHED',
  title: 'Post',
  views: 0,
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe('sendBlogPost', () => {
  beforeEach(() => {
    service.post.create.mockResolvedValue('post');
  });

  it('creates the post, then publishes it with the right to publish', async () => {
    await sendBlogPost(session, createBlog([publishBlogPostResourceRight]), 'Title', '<p>Content</p>');
    expect(service.post.create).toHaveBeenCalledWith(session, 'blog', 'Title', '<p>Content</p>');
    expect(service.post.publish).toHaveBeenCalledWith(session, 'blog', 'post');
    expect(service.post.submit).not.toHaveBeenCalled();
  });

  it('submits it with the right to submit', async () => {
    await sendBlogPost(session, createBlog([submitBlogPostResourceRight]), 'Title', 'Content');
    expect(service.post.submit).toHaveBeenCalledWith(session, 'blog', 'post');
    expect(service.post.publish).not.toHaveBeenCalled();
  });

  it('leaves a draft with the right to create only', async () => {
    await sendBlogPost(session, createBlog([createBlogPostResourceRight]), 'Title', 'Content');
    expect(service.post.publish).not.toHaveBeenCalled();
    expect(service.post.submit).not.toHaveBeenCalled();
  });

  it('throws when the publication fails (the post stays a draft)', async () => {
    service.post.publish.mockRejectedValue(new Error('publish'));
    await expect(sendBlogPost(session, createBlog([publishBlogPostResourceRight]), 'Title', 'Content')).rejects.toThrow('publish');
  });

  it('throws without right, before any request', async () => {
    await expect(sendBlogPost(session, createBlog([]), 'Title', 'Content')).rejects.toThrow();
    expect(service.post.create).not.toHaveBeenCalled();
  });
});

describe('editBlogPost', () => {
  it('publishes the post again with the right to publish', async () => {
    await editBlogPost(session, createBlog([publishBlogPostResourceRight]), 'post', 'Title', 'Content', 'PUBLISHED');
    expect(service.post.edit).toHaveBeenCalledWith(session, 'blog', 'post', 'Title', 'Content');
    expect(service.post.publish).toHaveBeenCalledWith(session, 'blog', 'post');
  });

  it('submits a post waiting for a validation, even with the right to publish', async () => {
    await editBlogPost(session, createBlog([publishBlogPostResourceRight]), 'post', 'Title', 'Content', 'SUBMITTED');
    expect(service.post.submit).toHaveBeenCalledWith(session, 'blog', 'post');
    expect(service.post.publish).not.toHaveBeenCalled();
  });

  it('submits without the right to publish', async () => {
    await editBlogPost(session, createBlog([submitBlogPostResourceRight]), 'post', 'Title', 'Content', 'PUBLISHED');
    expect(service.post.submit).toHaveBeenCalledWith(session, 'blog', 'post');
  });

  it('throws when the change fails', async () => {
    service.post.edit.mockRejectedValue(new Error('edit'));
    await expect(
      editBlogPost(session, createBlog([publishBlogPostResourceRight]), 'post', 'Title', 'Content', 'PUBLISHED'),
    ).rejects.toThrow('edit');
  });
});

describe('deleteBlogPost', () => {
  it('throws when it fails, so the screen tells it', async () => {
    service.post.delete.mockRejectedValue(new Error('delete'));
    await expect(deleteBlogPost(session, { blogId: 'blog', postId: 'post' })).rejects.toThrow('delete');
  });
});

describe('loadBlogPostDetails', () => {
  it('gives the post, its comments, and its comments as a thread with the types of account of their authors', async () => {
    const author = (userId: string) => ({ login: userId, userId, username: userId });
    service.post.get.mockResolvedValue(post);
    service.comments.get.mockResolvedValue([
      { author: author('teacher'), comment: 'Hello', created: moment(1000), id: 'comment', state: 'PUBLISHED' },
      { author: author('teacher'), comment: 'Again', created: moment(2000), id: 'reply', replyTo: 'comment', state: 'PUBLISHED' },
      { author: author('gone'), comment: '', created: moment(3000), deleted: true, id: 'deleted', state: 'PUBLISHED' },
    ]);
    service.accountTypes.mockResolvedValue({ teacher: AccountType.Teacher });

    const details = await loadBlogPostDetails(session, { blogId: 'blog', postId: 'post' });

    // The authors of the deleted comments are not asked: they are not shown
    expect(service.accountTypes).toHaveBeenCalledWith(session, ['teacher']);
    expect(details.comments).toHaveLength(3);
    expect(details.commentsThread.map(c => c.id)).toEqual(['deleted', 'comment']);
    expect(details.commentsThread[1]).toMatchObject({
      authorAccountType: AccountType.Teacher,
      replies: [expect.objectContaining({ id: 'reply' })],
    });
  });
});

describe('loadPostsPage', () => {
  const createTestStore = () => legacy_createStore(combineReducers({ blog: reducer }), applyMiddleware(thunk));

  it('puts the page of the published and submitted posts, with their audience', async () => {
    service.posts.page.mockResolvedValue([post]);
    service.posts.total.mockResolvedValue({ countAll: 9, countDraft: 4, countPublished: 3, countSubmitted: 2 });
    audience.view.getSummary.mockResolvedValue({ post: 7 });
    audience.reaction.getSummary.mockResolvedValue({
      reactionsByResource: { post: { reactionTypes: ['REACTION_1'], totalReactionsCounter: 1, userReaction: null } },
    } as never);
    // `resetAllMocks` drops the implementation of the mock: the page replaces the posts
    jest.mocked(staleOrSplice).mockImplementation(({ newData }) => newData);
    const store = createTestStore();

    await store.dispatch(loadPostsPage(session, 'blog', 0, 20, true));

    expect(service.posts.page).toHaveBeenCalledWith(session, 'blog', 0, 20, ['PUBLISHED', 'SUBMITTED']);
    const posts = store.getState().blog.posts.blog;
    expect(posts).toHaveLength(1);
    // The total of the list counts the published and submitted posts only (3 + 2), not the drafts
    expect(jest.mocked(staleOrSplice)).toHaveBeenCalledWith(expect.objectContaining({ reloadAll: true, start: 0, total: 5 }));
    expect(posts[0]).toMatchObject({
      _id: 'post',
      audience: { reactions: { total: 1, types: ['REACTION_1'], userReaction: null }, views: 7 },
    });
  });
});
