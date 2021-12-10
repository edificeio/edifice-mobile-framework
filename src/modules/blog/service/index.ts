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
      // const entcoreBlogFolderList = await fetchJSONWithCache(api) as IEntcoreBlogFolder[];
      const entcoreBlogFolderList = [{ "_id": "36dfb9e1-c68c-41be-8212-e03c33f91989", "name": "test editeur", "ressourceIds": ["8e685301-66c6-45cf-b0cc-6f07ca4da231"], "created": { "$date": 1594970737054 }, "modified": { "$date": 1638172170278 }, "owner": { "userId": "91c22b66-ba1b-4fde-a3fe-95219cc18d4a", "displayName": "Isabelle polo" }, "parentId": "9bbb18e3-da7a-495c-8bc7-72595d5f3ce4" }, { "_id": "3ccdc199-474a-4775-9b3a-3935abfa2925", "name": "dossier crÃ©Ã©", "ressourceIds": [], "created": { "$date": 1622823093530 }, "modified": { "$date": 1622823177641 }, "owner": { "userId": "91c22b66-ba1b-4fde-a3fe-95219cc18d4a", "displayName": "Isabelle Poloniossssss" } }, { "_id": "e839591e-6405-4a58-b130-673df1839a6e", "name": "dossier 2", "ressourceIds": [], "created": { "$date": 1622823107432 }, "modified": { "$date": 1622823177566 }, "owner": { "userId": "91c22b66-ba1b-4fde-a3fe-95219cc18d4a", "displayName": "Isabelle Poloniossssss" }, "parentId": "3ccdc199-474a-4775-9b3a-3935abfa2925" }, { "_id": "0c84b54a-8b42-4506-b7b0-933f5f515d30", "name": "test", "ressourceIds": ["74b44b38-37e9-43b1-b773-15569f0509a3"], "created": { "$date": 1622818226765 }, "modified": { "$date": 1622822170664 }, "owner": { "userId": "91c22b66-ba1b-4fde-a3fe-95219cc18d4a", "displayName": "Isabelle Poloniossssss" }, "parentId": "b9de640d-a9fe-4086-becc-cb3d72570a67" }, { "_id": "b9de640d-a9fe-4086-becc-cb3d72570a67", "name": "COVID-19", "ressourceIds": ["1e191d53-42b3-4dd1-b242-a1bbe511bc0e"], "created": { "$date": 1577381501058 }, "modified": { "$date": 1622822017479 }, "owner": { "userId": "91c22b66-ba1b-4fde-a3fe-95219cc18d4a", "displayName": "Isabelle Polonio" }, "parentId": "9bbb18e3-da7a-495c-8bc7-72595d5f3ce4" }, { "_id": "9bbb18e3-da7a-495c-8bc7-72595d5f3ce4", "name": "Lorem ipsum dolors sitis lorem ipsum dolors sitis lorem ipsum dolors sitis lorem ipsum dolors sitis", "ressourceIds": [], "created": { "$date": 1605715229439 }, "modified": { "$date": 1622821996886 }, "owner": { "userId": "91c22b66-ba1b-4fde-a3fe-95219cc18d4a", "displayName": "Isabelle Polonio" } }, { "_id": "8663a220-2055-42bb-b19f-36b328c2cd77", "name": "pk", "ressourceIds": [], "created": { "$date": 1577703395468 }, "modified": { "$date": 1589982918080 }, "owner": { "userId": "91c22b66-ba1b-4fde-a3fe-95219cc18d4a", "displayName": "Isabelle Polonio ðŸ·" }, "trashed": true }, { "_id": "9499b89d-58a3-4a1b-bb9d-89f6eef05725", "parentId": "c512c7cd-c4b1-4327-b751-858e854eff7c", "name": "Underworld", "ressourceIds": [], "owner": { "userId": "91c22b66-ba1b-4fde-a3fe-95219cc18d4a", "displayName": "ISABELLE POLONIO (professeur d'arts plastiques)" }, "created": { "$date": 1561993877052 }, "modified": { "$date": 1576055609971 }, "trashed": true }]
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
