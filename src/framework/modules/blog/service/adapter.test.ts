import { AccountType } from '~/modules/auth/model';

import { toAccountType, toBlog, toBlogPost, toCommentBody, toPostBody } from './adapter';
import type { API } from './types';

const author: API.Author = { login: 'login', userId: 'user', username: 'User' };

describe('toPostBody', () => {
  it('gives the body of a post, in the order the server always got it', () => {
    expect(JSON.stringify(toPostBody('Title', '<p>Content</p>'))).toBe('{"content":"<p>Content</p>","title":"Title"}');
  });
});

describe('toCommentBody', () => {
  it('gives the body of a comment', () => {
    expect(JSON.stringify(toCommentBody('Hello'))).toBe('{"comment":"Hello"}');
  });

  it('gives the body of a reply, with the comment it replies to', () => {
    expect(JSON.stringify(toCommentBody('Hello', 'comment'))).toBe('{"comment":"Hello","replyTo":"comment"}');
  });
});

describe('toAccountType', () => {
  it('gives the first type of the user', () => {
    expect(toAccountType({ result: [{ type: ['Teacher', 'Personnel'] }], status: 'ok' })).toBe(AccountType.Teacher);
  });

  it('gives nothing for a user not found', () => {
    expect(toAccountType({ result: [], status: 'ok' })).toBeUndefined();
  });
});

describe('toBlog', () => {
  it('gives the blog with its id and its dates', () => {
    const blog = toBlog({
      '_id': 'blog',
      'allowReplies': true,
      'author': author,
      'comment-type': 'IMMEDIATE',
      'created': { $date: 1000 },
      'fetchPosts': [],
      'modified': { $date: 2000 },
      'publish-type': 'RESTRAINT',
      'rights': ['creator:author'],
      'title': 'Blog',
      'visibility': 'OWNER',
    });
    expect(blog.id).toBe('blog');
    expect(blog.allowReplies).toBe(true);
    expect(blog.rights).toEqual(['creator:author']);
    expect(blog.created.valueOf()).toBe(1000);
    expect(blog.modified.valueOf()).toBe(2000);
    expect(blog).not.toHaveProperty('fetchPosts');
  });
});

describe('toBlogPost', () => {
  const post: API.BlogPost = {
    _id: 'post',
    author,
    content: '<p>Content</p>',
    created: { $date: 1000 },
    modified: { $date: 2000 },
    state: 'PUBLISHED',
    title: 'Post',
    views: 3,
  };

  it('gives the post with its dates, without comments when the server sends none', () => {
    const adapted = toBlogPost(post);
    expect(adapted.created.valueOf()).toBe(1000);
    expect(adapted.firstPublishDate).toBeUndefined();
    expect(adapted.comments).toBeUndefined();
    expect(adapted.pinned).toBe(false);
  });

  it('gives whether the post is pinned', () => {
    expect(toBlogPost({ ...post, pinned: true }).pinned).toBe(true);
  });

  it('gives its comments with their dates', () => {
    const adapted = toBlogPost({
      ...post,
      comments: [
        { author, comment: 'Hello', created: { $date: '1970-01-01T00:00:03.000Z' }, id: 'comment', state: 'PUBLISHED' },
        {
          author,
          comment: 'Hi',
          created: { $date: '1970-01-01T00:00:04.000Z' },
          id: 'reply',
          replyTo: 'comment',
          state: 'PUBLISHED',
        },
      ],
    });
    expect(adapted.comments?.[0].created.valueOf()).toBe(3000);
    expect(adapted.comments?.[0].modified).toBeUndefined();
    expect(adapted.comments?.[1].replyTo).toBe('comment');
  });
});
