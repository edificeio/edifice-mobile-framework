/**
 * From the API format to the model for what `blog` reads, and back for what it writes.
 */
import moment from 'moment';

import type { Blog, BlogAuthor, BlogPost, BlogPostComments } from '~/framework/modules/blog/model';
import { AccountType } from '~/modules/auth/model';

import type { API } from './types';

const toAuthor = (author: API.Author): BlogAuthor => ({
  login: author.login,
  userId: author.userId,
  username: author.username,
});

export const toBlog = (blog: API.Blog): Blog => ({
  'allowReplies': blog.allowReplies,
  'author': toAuthor(blog.author),
  'comment-type': blog['comment-type'],
  'created': moment(blog.created.$date),
  'description': blog.description,
  'id': blog._id,
  'modified': moment(blog.modified.$date),
  'publish-type': blog['publish-type'],
  'rights': blog.rights,
  'shared': blog.shared,
  'thumbnail': blog.thumbnail,
  'title': blog.title,
  'trashed': blog.trashed,
  'visibility': blog.visibility,
});

export const toBlogPostComments = (comments: API.Comment[]): BlogPostComments =>
  comments.map(comment => ({
    ...comment,
    created: moment(comment.created.$date),
    modified: comment.modified ? moment(comment.modified.$date) : undefined,
  }));

export const toBlogPost = (post: API.BlogPost): BlogPost => ({
  _id: post._id,
  author: toAuthor(post.author),
  comments: post.comments && toBlogPostComments(post.comments),
  content: post.content,
  created: moment(post.created.$date),
  firstPublishDate: post.firstPublishDate && moment(post.firstPublishDate.$date),
  modified: moment(post.modified.$date),
  pinned: post.pinned ?? false,
  state: post.state,
  title: post.title,
  views: post.views,
});

/** Body that creates or changes a post, in the order the server always got it. */
export const toPostBody = (title: string, contentHtml: string): API.PostBody => ({ content: contentHtml, title });

/** Body that publishes (a reply when `replyTo` is given) or changes a comment. */
export const toCommentBody = (comment: string, replyTo?: string): API.CommentBody => ({ comment, replyTo });

const accountTypes: Record<string, AccountType> = {
  External: AccountType.External,
  Guest: AccountType.Guest,
  Personnel: AccountType.Personnel,
  Relative: AccountType.Relative,
  Student: AccountType.Student,
  Teacher: AccountType.Teacher,
};

/** The type of account of a user, from his public data. `undefined` if the server gives none (user not found). */
export const toAccountType = (person: API.PersonResponse): AccountType | undefined => {
  const type = person.result[0]?.type[0];
  return type ? accountTypes[type] : undefined;
};
