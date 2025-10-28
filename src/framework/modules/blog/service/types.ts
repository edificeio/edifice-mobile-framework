export interface IEntcoreBlog {
  '_id': string;
  'visibility': string;
  'title': string;
  'thumbnail'?: string;
  'trashed'?: boolean;
  'comment-type': string;
  'publish-type': string;
  'description'?: string;
  'created': { $date: number };
  'modified': { $date: number };
  'author': IEntcoreBlogPostBaseAuthor;
  'shared'?: ({
    [key: string]: boolean | string | undefined;
  } & {
    [key in 'userId' | 'groupId']: string;
  })[];
  'fetchPosts'?: Omit<IEntcoreBlogPost, 'content'>[];
}
export type IEntcoreBlogList = IEntcoreBlog[];

export interface IEntcoreBlogPostBaseAuthor {
  login: string;
  userId: string;
  username: string;
}
interface IEntcoreBlogPostBase {
  author: IEntcoreBlogPostBaseAuthor;
  comments?: IEntcoreBlogPostComments;
  content: string;
  created: { $date: number };
  modified: { $date: number };
  state: string;
  title: string;
  views: number;
  _id: string;
}

export interface IEntcoreBlogPost extends IEntcoreBlogPostBase {
  firstPublishDate?: { $date: number };
}

export type IEntcoreBlogPostList = IEntcoreBlogPost[];

export interface IEntcoreCreatedBlogPost extends IEntcoreBlogPostBase {
  comments: any[];
  blog: {
    $ref: string;
    $id: string;
  };
  sorted: { $date: number };
  contentPlain: string;
}

export interface IEntcoreBlogPostComment {
  author: IEntcoreBlogPostBaseAuthor;
  coauthor?: {
    login: string;
    userId: string;
    username: string;
  };
  comment: string;
  created: { $date: number };
  id: string;
  modified?: { $date: number };
  state: string;
  deleted?: boolean;
}

export type IEntcoreBlogPostComments = IEntcoreBlogPostComment[];

export interface IEntcoreBlogFolder {
  _id: string;
  name: string;
  ressourceIds: string[];
  created: { $date: number };
  modified: { $date: number };
  owner: { userId: string; displayName: string };
  parentId?: string;
  trashed?: boolean;
}
