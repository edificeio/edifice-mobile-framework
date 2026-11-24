/**
 * Formats of the API of `blog`. They don't leave `service/`: the service takes and gives types of the model (see `adapter.ts`).
 */
import type * as Model from '~/framework/modules/blog/model';

export namespace API {
  export interface Author {
    login: string;
    userId: string;
    username: string;
  }

  /** A date of the server. */
  export interface Date {
    $date: number;
  }

  /** A blog (`GET /blog/:blogId`, `GET /blog/list/all`). */
  export interface Blog {
    '_id': string;
    'allowReplies': boolean;
    'visibility': string;
    'title': string;
    'thumbnail'?: string;
    'trashed'?: boolean;
    'comment-type': string;
    'publish-type': string;
    'description'?: string;
    'created': Date;
    'modified': Date;
    'author': Author;
    /** The rights on the blog, by user or group: `creator:<userId>`, `user:<userId>:<right>`, `group:<groupId>:<right>`. */
    'rights': string[];
    'shared'?: ({
      [key: string]: boolean | string | undefined;
    } & {
      [key in 'userId' | 'groupId']: string;
    })[];
    'fetchPosts'?: Omit<BlogPost, 'content'>[];
  }

  /** A comment of a post (`GET /blog/comments/:blogId/:postId`), or a reply to one (`replyTo`). Its `created` is an ISO string. */
  export interface Comment {
    author: Author;
    coauthor?: Author;
    comment: string;
    created: { $date: string };
    id: string;
    modified?: Date;
    state: string;
    deleted?: boolean;
    /** The comment it replies to. */
    replyTo?: string;
  }

  /** A post (`GET /blog/post/:blogId/:postId`, `GET /blog/post/list/all/:blogId`). */
  export interface BlogPost {
    author: Author;
    comments?: Comment[];
    content: string;
    created: Date;
    firstPublishDate?: Date;
    modified: Date;
    pinned?: boolean;
    state: string;
    title: string;
    views: number;
    _id: string;
  }

  /** The post created (`POST /blog/post/:blogId`). */
  export interface CreatedBlogPost extends BlogPost {
    blog: { $ref: string; $id: string };
    sorted: Date;
    contentPlain: string;
  }

  /** Body that creates or changes a post (`POST /blog/post/:blogId`, `PUT /blog/post/:blogId/:postId`). */
  export interface PostBody {
    content: string;
    title: string;
  }

  /** Body that publishes or changes a comment (`POST` / `PUT /blog/comment/…`). */
  export interface CommentBody {
    comment: string;
    /** The comment it replies to (publication only). */
    replyTo?: string;
  }

  /** Public data of a user (`GET /userbook/api/person?id=:userId`): the comments need the type of account of their authors. */
  export interface PersonResponse {
    status: 'ok';
    result: { type: string[] }[];
  }

  /** Numbers of posts of a blog (`GET /blog/counter/:blogId`). */
  export type PostCountsResponse = Model.BlogPostCounts;
}
