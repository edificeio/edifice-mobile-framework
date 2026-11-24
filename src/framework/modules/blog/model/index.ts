/**
 * Types of the domain of `blog`: the blogs, their posts and the comments of the posts.
 */
import type { Moment } from 'moment';

import type { AnyCommentItem } from '~/framework/modules/comments/types';

export interface BlogAuthor {
  login: string;
  userId: string;
  username: string;
}

export interface Blog {
  'id': string;
  /** Whether the comments of its posts can be replied to. */
  'allowReplies': boolean;
  'visibility': string;
  'title': string;
  'thumbnail'?: string;
  'trashed'?: boolean;
  'comment-type': string;
  /** `IMMEDIATE`: a post submitted is published at once; `RESTRAINT`: it waits for a validation. */
  'publish-type': string;
  'description'?: string;
  'created': Moment;
  'modified': Moment;
  'author': BlogAuthor;
  /** The rights on the blog, by user or group (`computeRights`): who can comment (`computeCanComment`). */
  'rights': string[];
  /** The sharing of the blog: by user or group, the rights given (`resourceHasRight`). */
  'shared'?: ({
    [key: string]: boolean | string | undefined;
  } & {
    [key in 'userId' | 'groupId']: string;
  })[];
}
export type BlogList = Blog[];

export interface BlogPostComment {
  author: BlogAuthor;
  coauthor?: BlogAuthor;
  comment: string;
  created: Moment;
  id: string;
  modified?: Moment;
  state: string;
  deleted?: boolean;
  /** The comment it replies to: a reply. */
  replyTo?: string;
}

/** The comments of a post and their replies, as the server gives them: one list, by date. */
export type BlogPostComments = BlogPostComment[];

/** The comments of a post as `comments` shows them: the comments, the most recent first, each with its replies. */
export type BlogPostCommentsThread = AnyCommentItem[];

export interface BlogPost {
  author: BlogAuthor;
  /** Given by the details of a post, and by the lists of posts when the server sends them. */
  comments?: BlogPostComments;
  content: string;
  created: Moment;
  firstPublishDate?: Moment;
  modified: Moment;
  /** Shown first in the list of the posts, and marked. */
  pinned: boolean;
  /** `PUBLISHED`, `SUBMITTED`… */
  state: string;
  title: string;
  views: number;
  _id: string;
}

/** The audience of a post (`audience`): its views and its reactions. */
export interface BlogPostAudience {
  views?: number;
  reactions?: {
    total: number;
    types: string[];
    userReaction: string;
  };
}

export interface BlogPostWithAudience extends BlogPost {
  audience?: BlogPostAudience;
}

export type BlogPostList = BlogPostWithAudience[];

/** A post opened, with its comments as a thread (`commentsThread`). */
export interface BlogPostDetails extends BlogPostWithAudience {
  commentsThread: BlogPostCommentsThread;
}

/** A post, by its blog. */
export interface BlogPostIds {
  blogId: string;
  postId: string;
}

/** A comment, by its post. */
export interface BlogPostCommentIds extends BlogPostIds {
  commentId: string;
}

/** Numbers of posts of a blog, by state. */
export interface BlogPostCounts {
  countPublished: number;
  countDraft: number;
  countSubmitted: number;
  countAll: number;
}
