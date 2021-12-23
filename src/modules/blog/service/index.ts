/**
 * Blog services
 */

import moment from 'moment';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { IResourceUriCaptureFunction } from '~/framework/util/notifications';
import { IUserSession } from '~/framework/util/session';
import { fetchJSONWithCache, signedFetchJson } from '~/infra/fetchWithCache';
import { IBlog, IBlogFolder, IBlogList, IBlogPost, IBlogPostComments, IBlogPostList } from '~/modules/blog/reducer';

export interface IEntcoreBlog {
  _id: string;
  visibility: string;
  title: string;
  thumbnail?: string;
  trashed?: boolean;
  'comment-type': string;
  'publish-type': string;
  description?: string;
  created: { $date: number };
  modified: { $date: number };
  author: { userId: string; username: string; login: string };
  shared?: ({
    [key: string]: boolean | string | undefined;
  } & {
    [key in 'userId' | 'groupId']: string;
  })[];
  fetchPosts?: Omit<IEntcoreBlogPost, 'content'>[];
}
export type IEntcoreBlogList = IEntcoreBlog[];

interface _IEntcoreBlogPostBase {
  author: {
    login: string;
    userId: string;
    username: string;
  };
  content: string;
  created: { $date: number };
  modified: { $date: number };
  state: string;
  title: string;
  views: number;
  _id: string;
}

export interface IEntcoreBlogPost extends _IEntcoreBlogPostBase {
  firstPublishDate?: { $date: number };
}

export type IEntcoreBlogPostList = IEntcoreBlogPost[];

export interface IEntcoreCreatedBlogPost extends _IEntcoreBlogPostBase {
  comments: any[];
  blog: {
    $ref: string;
    $id: string;
  };
  sorted: { $date: number };
  contentPlain: string;
}

export interface IEntcoreBlogPostComment {
  author: {
    login: string;
    userId: string;
    username: string;
  };
  comment: string;
  created: { $date: number };
  id: string;
  state: string;
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

export const blogAdapter = (blog: IEntcoreBlog) => {
  const ret = {
    id: blog._id,
    visibility: blog.visibility,
    title: blog.title,
    thumbnail: blog.thumbnail,
    trashed: blog.trashed,
    'comment-type': blog['comment-type'],
    'publish-type': blog['publish-type'],
    description: blog.description,
    created: moment(blog.created.$date),
    modified: moment(blog.modified.$date),
    author: {
      login: blog.author.login,
      userId: blog.author.userId,
      username: blog.author.username,
    },
    shared: blog.shared,
    fetchPosts: blog.fetchPosts?.map(bp => blogFetchPostAdapter(bp)),
  };
  return ret as IBlog;
};

export const blogFetchPostAdapter = (blogPost: Omit<IEntcoreBlogPost, 'content'>) => {
  const ret = {
    _id: blogPost._id,
    author: {
      login: blogPost.author.login,
      userId: blogPost.author.userId,
      username: blogPost.author.username,
    },
    created: moment(blogPost.created.$date),
    modified: moment(blogPost.modified.$date),
    firstPublishDate: blogPost.firstPublishDate?.$date && moment(blogPost.firstPublishDate.$date),
    state: blogPost.state,
    title: blogPost.title,
    views: blogPost.views,
  };
  return ret as Omit<IBlogPost, 'content'>;
};

export const blogPostAdapter = (blogPost: IEntcoreBlogPost) => {
  const ret = {
    author: {
      login: blogPost.author.login,
      userId: blogPost.author.userId,
      username: blogPost.author.username,
    },
    content: blogPost.content,
    created: moment(blogPost.created.$date),
    firstPublishDate: blogPost.firstPublishDate && moment(blogPost.firstPublishDate.$date),
    modified: moment(blogPost.modified.$date),
    state: blogPost.state,
    title: blogPost.title,
    views: blogPost.views,
    _id: blogPost._id,
  };
  return ret as IBlogPost;
};

export const blogFolderAdapter = (blogFolder: IEntcoreBlogFolder) => {
  return {
    ...blogFolder,
    id: blogFolder._id,
    created: moment(blogFolder.created.$date),
    modified: moment(blogFolder.created.$date),
    resourceIds: blogFolder.ressourceIds,
  } as IBlogFolder;
};

export const blogPostCommentsAdapter = (blogPostComments: IEntcoreBlogPostComments) => {
  const ret = blogPostComments.map(blogPostComment => ({ ...blogPostComment, created: moment(blogPostComment.created.$date) }));
  return ret as IBlogPostComments;
};

export const blogUriCaptureFunction: IResourceUriCaptureFunction<{ blogId: string; postId: string }> = url => {
  const blogPostIdRegex = /^\/blog.+\/([a-z0-9-]{36})\/([a-z0-9-]{36})\/?/;
  const blogIdRegex = /^\/blog.+\/([a-z0-9-]{36})\/?/;
  const blogPostIdMatch = url.match(blogPostIdRegex);
  return !blogPostIdMatch
    ? {
        blogId: url.match(blogIdRegex)?.[1],
      }
    : {
        blogId: blogPostIdMatch?.[1],
        postId: blogPostIdMatch?.[2],
      };
};

export const blogService = {
  // This service automatically filters only non-trashed content.
  list: async (session: IUserSession) => {
    const api = `/blog/list/all`;
    const entcoreBlogList = (await fetchJSONWithCache(api)) as IEntcoreBlogList;
    return (entcoreBlogList.map(b => blogAdapter(b)) as IBlogList).filter(b => !b.trashed);
  },
  // This service automatically filters only non-trashed content.
  folders: {
    list: async (session: IUserSession) => {
      const api = `/blog/folder/list/all`;
      const entcoreBlogFolderList = (await fetchJSONWithCache(api)) as IEntcoreBlogFolder[];
      return (entcoreBlogFolderList.map(b => blogFolderAdapter(b as IEntcoreBlogFolder)) as IBlogFolder[]).filter(f => !f.trashed);
    },
  },
  posts: {
    get: async (session: IUserSession, blogId: string) => {
      const api = `/blog/post/list/all/${blogId}`;
      const entcoreBlogPostList = (await fetchJSONWithCache(api)) as IEntcoreBlogPostList;
      return (entcoreBlogPostList.map(bp => blogPostAdapter(bp)) as IBlogPostList);
    },
  },
  post: {
    get: async (session: IUserSession, blogPostId: { blogId: string; postId: string }, state?: string) => {
      const { blogId, postId } = blogPostId;
      let api = `/blog/post/${blogId}/${postId}`;
      if (state) {api += `?state=${state}`};
      const entcoreBlogPost = (await fetchJSONWithCache(api)) as IEntcoreBlogPost;
      // Run the adapter for the received blog post
      return blogPostAdapter(entcoreBlogPost) as IBlogPost;
    },
    create: async (session: IUserSession, blogId: string, postTitle: string, postContentHtml: string) => {
      const api = `/blog/post/${blogId}`;
      const body = JSON.stringify({ title: postTitle, content: postContentHtml });
      return signedFetchJson(`${DEPRECATED_getCurrentPlatform()!.url}${api}`, {
        method: 'POST',
        body,
      }) as Promise<IEntcoreCreatedBlogPost>;
    },
    submit: async (session: IUserSession, blogId: string, postId: string) => {
      const api = `/blog/post/submit/${blogId}/${postId}`;
      return signedFetchJson(`${DEPRECATED_getCurrentPlatform()!.url}${api}`, { method: 'PUT' }) as Promise<{ number: number }>;
    },
    publish: async (session: IUserSession, blogId: string, postId: string) => {
      const api = `/blog/post/publish/${blogId}/${postId}`;
      return signedFetchJson(`${DEPRECATED_getCurrentPlatform()!.url}${api}`, { method: 'PUT' }) as Promise<{ number: number }>;
    },
  },
  comments: {
    get: async (session: IUserSession, blogPostId: { blogId: string; postId: string }) => {
      const { blogId, postId } = blogPostId;
      const api = `/blog/comments/${blogId}/${postId}`;
      const entcoreBlogPostComments = (await fetchJSONWithCache(api)) as IEntcoreBlogPostComments;
      // Run the adapter for the received blog post comments
      return blogPostCommentsAdapter(entcoreBlogPostComments) as IBlogPostComments;
    },
  },
};
