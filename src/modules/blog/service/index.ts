/**
 * Blog services
 */

import moment from 'moment';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { IResourceUriCaptureFunction } from '~/framework/util/notifications';
import { IUserSession } from '~/framework/util/session';
import { fetchJSONWithCache, signedFetchJson } from '~/infra/fetchWithCache';

import { IBlog, IBlogFolder, IBlogList, IBlogPost, IBlogPostComments } from "../reducer";

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
  fetchPosts?: (Omit<IEntcoreBlogPost, 'content'>)[];
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
  ressourceIds: string[],
  created: { $date: number };
  modified: { $date: number };
  owner: { userId: string; displayName: string; };
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
    fetchPosts: blog.fetchPosts?.map(bp => blogFetchPostAdapter(bp))
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
    firstPublishDate: moment(blogPost.firstPublishDate.$date),
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
}

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
  post: {
    get: async (session: IUserSession, blogPostId: { blogId: string; postId: string }) => {
      const { blogId, postId } = blogPostId;
      const api = `/blog/post/${blogId}/${postId}`;
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
  list: async (session: IUserSession) => {
    const api = `/blog/list/all`;
    const entcoreBlogList = (await fetchJSONWithCache(api)) as IEntcoreBlogList;
    return entcoreBlogList.map(b => blogAdapter(b)) as IBlogList;
  },

  folders: {
    list: async (session: IUserSession) => {
      const api = `/blog/folder/list/all`;
      const entcoreBlogFolderList = await fetchJSONWithCache(api) as IEntcoreBlogFolder[];
      // const entcoreBlogFolderList = /* catherine.bailly */ [{ "_id": "aa20217d-c91e-4274-8ce0-2c5465c0e26e", "name": "tutu", "ressourceIds": ["c1a58c45-199e-42e8-8ae9-63c6960fbce8"], "owner": { "userId": "8f437f63-1115-44c3-a3a3-33531ae80d90", "displayName": "Catherine Bailly" }, "created": { "$date": 1566916618789 }, "modified": { "$date": 1638972784967 }, "trashed": true }, { "_id": "5423ebd6-3c8e-42c8-b7ad-f12a8c9b4c51", "parentId": "77f71b77-18ef-4ae6-aeb6-d28918125126", "name": "test niveau 2", "ressourceIds": ["8a175c10-cfa2-4aa9-b441-8a197dd20c93", "921207a0-3205-41b5-a8f9-56d1fa787064"], "created": { "$date": 1638972550201 }, "modified": { "$date": 1638972553720 }, "owner": { "userId": "8f437f63-1115-44c3-a3a3-33531ae80d90", "displayName": "Catherine Bailly" } }, { "_id": "77f71b77-18ef-4ae6-aeb6-d28918125126", "name": "test avec ?", "ressourceIds": ["570c3751-7e6a-4ae7-a8dc-302cfc05199b", "9a3b6530-9fb0-46eb-b6da-ad2602de8583", "980d837f-19af-40a8-ad61-64b1bffb8160"], "owner": { "userId": "8f437f63-1115-44c3-a3a3-33531ae80d90", "displayName": "BAILLY Catherine" }, "created": { "$date": 1561650702560 }, "modified": { "$date": 1638972553659 }, "trashed": false }, { "_id": "b8973ddc-dbc3-4535-a040-617fe8d1fdae", "name": "test_partage", "ressourceIds": ["3a3fada4-7639-4446-a4ff-cdc8c6c8ea4d"], "owner": { "userId": "8f437f63-1115-44c3-a3a3-33531ae80d90", "displayName": "BAILLY Catherine" }, "created": { "$date": 1562173337918 }, "modified": { "$date": 1562173362410 } }]
      return entcoreBlogFolderList.map(b => blogFolderAdapter(b as IEntcoreBlogFolder)) as IBlogFolder[];
    },
  },
  tree: async (session: IUserSession) => {
    const api = {
      blogs: `/blog/list/all`,
      folders: `blog/folder/list/all`
    };

  }
};
