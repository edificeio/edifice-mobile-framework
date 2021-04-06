/**
 * Blog services
 */

import moment from "moment";
import { IResourceUriCaptureFunction } from "../../../framework/notifications";
import { IUserSession } from "../../../framework/session";
import { fetchJSONWithCache } from "../../../infra/fetchWithCache";
import { IBlog, IBlogList, IBlogPost, IBlogPostComments } from "../reducer";

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
  author: { userId: string; username: string; login: string; };
  shared?: Array<{
    [key: string]: boolean | string | undefined,
  } & {
    [key in 'userId' | 'groupId']: string
  }>;
}
export type IEntcoreBlogList = IEntcoreBlog[];

export interface IEntcoreBlogPostComment {
  author: {
    login: string;
    userId: string;
    username: string;
  }
  comment: string;
  created: {$date: number};
  id: string;
  state: string;
}

export type IEntcoreBlogPostComments = IEntcoreBlogPostComment[];

export interface IEntcoreBlogPost {
  author: {
    login: string;
    userId: string;
    username: string;
  }
  content: string;
  created: {$date: number};
  firstPublishDate: {$date: number};
  modified: {$date: number};
  state: string;
  title: string;
  views: number;
  _id: string;
}

export const blogAdapter = (blog: IEntcoreBlog) => {
  const ret = {
    id: blog._id,
    visibility: blog.visibility,
    title: blog.title,
    thumbnail: blog.thumbnail,
    trashed: blog.trashed,
    'comment-type': blog["comment-type"],
    'publish-type': blog["publish-type"],
    description: blog.description,
    created: moment(blog.created.$date),
    modified: moment(blog.modified.$date),
    author: {
      login: blog.author.login,
      userId: blog.author.userId,
      username: blog.author.username,
    },
    shared: blog.shared
  };
  return ret as IBlog;
}

export const blogPostCommentsAdapter = (blogPostComments: IEntcoreBlogPostComments) => {
  const ret = blogPostComments.map(blogPostComment => ({...blogPostComment, created: moment(blogPostComment.created.$date)}));
  return ret as IBlogPostComments;
}

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
}

export const blogUriCaptureFunction: IResourceUriCaptureFunction<{ blogId: string, postId: string }> = url => {
  const blogPostIdRegex = /^\/blog.+\/([a-z0-9-]{36})\/([a-z0-9-]{36})\/?/;
  const blogIdRegex = /^\/blog.+\/([a-z0-9-]{36})\/?/;
  const blogPostIdMatch = url.match(blogPostIdRegex);
  return !blogPostIdMatch
    ? {
        blogId: url.match(blogIdRegex)?.[1]
      }
    : {
        blogId: blogPostIdMatch?.[1],
        postId: blogPostIdMatch?.[2]
      };
  }

export const blogService = {
  post: {
    get: async (session: IUserSession, blogPostId: { blogId: string, postId: string }) => {
      const {blogId, postId} = blogPostId;
      const api = `/blog/post/${blogId}/${postId}`;
      const entcoreBlogPost = await fetchJSONWithCache(api) as IEntcoreBlogPost;
      // Run the adapter for the received blog post
      return blogPostAdapter(entcoreBlogPost) as IBlogPost;
    }
  },
  comments: {
    get: async (session: IUserSession, blogPostId: { blogId: string, postId: string }) => {
      const {blogId, postId} = blogPostId;
      const api = `/blog/comments/${blogId}/${postId}`;
      const entcoreBlogPostComments = await fetchJSONWithCache(api) as IEntcoreBlogPostComments;
      // Run the adapter for the received blog post comments
      return blogPostCommentsAdapter(entcoreBlogPostComments) as IBlogPostComments;
    }
  },
  list: async (session: IUserSession) => {
    const api = `/blog/list/all`;
    const entcoreBlogList = await fetchJSONWithCache(api) as IEntcoreBlogList;
    return entcoreBlogList.map(b => blogAdapter(b)) as IBlogList;
  }
}
