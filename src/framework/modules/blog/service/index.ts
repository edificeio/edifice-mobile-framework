/**
 * Blog services
 */

import { blogAdapter, blogFolderAdapter, blogPostAdapter, blogPostCommentsAdapter } from './adapters';
import {
  IEntcoreBlog,
  IEntcoreBlogFolder,
  IEntcoreBlogList,
  IEntcoreBlogPost,
  IEntcoreBlogPostComments,
  IEntcoreBlogPostList,
  IEntcoreCreatedBlogPost,
} from './types';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { BlogList } from '~/framework/modules/blog/reducer';
import { sessionFetch } from '~/framework/util/transport';

export const blogService = {
  comments: {
    delete: async (session: AuthActiveAccount, blogPostCommentId: { blogId: string; postId: string; commentId: string }) => {
      const { blogId, commentId, postId } = blogPostCommentId;
      const api = `/blog/comment/${blogId}/${postId}/${commentId}`;
      return sessionFetch.json<{ number: number }>(api, { method: 'DELETE' });
    },
    get: async (session: AuthActiveAccount, blogPostId: { blogId: string; postId: string }) => {
      const { blogId, postId } = blogPostId;
      const api = `/blog/comments/${blogId}/${postId}`;
      const entcoreBlogPostComments = await sessionFetch.json<IEntcoreBlogPostComments>(api);
      // Run the adapter for the received blog post comments
      return blogPostCommentsAdapter(entcoreBlogPostComments);
    },
    publish: async (session: AuthActiveAccount, blogPostId: { blogId: string; postId: string }, comment: string) => {
      const { blogId, postId } = blogPostId;
      const api = `/blog/comment/${blogId}/${postId}`;
      const body = JSON.stringify({ comment });
      return sessionFetch.json<{ number: number }>(api, { body, method: 'POST' });
    },
    update: async (
      session: AuthActiveAccount,
      blogPostCommentId: { blogId: string; postId: string; commentId: string },
      comment: string,
    ) => {
      const { blogId, commentId, postId } = blogPostCommentId;
      const api = `/blog/comment/${blogId}/${postId}/${commentId}`;
      const body = JSON.stringify({ comment });
      return sessionFetch.json<{ number: number }>(api, { body, method: 'PUT' });
    },
  },

  // This service automatically filters only non-trashed content.
  folders: {
    list: async (_: AuthActiveAccount) => {
      const api = `/blog/folder/list/all`;
      const entcoreBlogFolderList = await sessionFetch.json<IEntcoreBlogFolder[]>(api);
      return entcoreBlogFolderList.map(b => blogFolderAdapter(b)).filter(f => !f.trashed);
    },
  },

  get: async (session: AuthActiveAccount, blogId: string) => {
    const api = `/blog/${blogId}`;
    const entcoreBlog = await sessionFetch.json<IEntcoreBlog>(api);
    return blogAdapter(entcoreBlog);
  },
  // This service automatically filters only non-trashed content.
  list: async (_: AuthActiveAccount) => {
    const api = `/blog/list/all`;
    const entcoreBlogList = await sessionFetch.json<IEntcoreBlogList>(api);
    const blogList = [] as BlogList;
    for (const entcoreBlog of entcoreBlogList) {
      if (!entcoreBlog.trashed) blogList.push(blogAdapter(entcoreBlog));
    }
    return blogList;
  },
  post: {
    create: async (_: AuthActiveAccount, blogId: string, postTitle: string, postContentHtml: string) => {
      const api = `/blog/post/${blogId}`;
      const body = JSON.stringify({ content: postContentHtml, title: postTitle });
      return sessionFetch.json<IEntcoreCreatedBlogPost>(api, { body, method: 'POST' });
    },
    delete: async (session: AuthActiveAccount, blogPostId: { blogId: string; postId: string }) => {
      const { blogId, postId } = blogPostId;
      const api = `/blog/post/${blogId}/${postId}`;
      return sessionFetch(api, { method: 'DELETE' });
    },
    edit: async (session: AuthActiveAccount, blogId: string, postId: string, postTitle: string, postContentHtml: string) => {
      const api = `/blog/post/${blogId}/${postId}`;
      const body = JSON.stringify({ content: postContentHtml, title: postTitle });
      return sessionFetch(api, { body, method: 'PUT' });
    },
    get: async (session: AuthActiveAccount, blogPostId: { blogId: string; postId: string }, state?: string) => {
      const { blogId, postId } = blogPostId;
      if (!state) {
        const apiMetadata = `/blog/post/list/all/${blogId}?postId=${postId}`;
        const entcoreBlogPostMetadata = await sessionFetch.json<IEntcoreBlogPost>(apiMetadata);
        state = entcoreBlogPostMetadata[0].state;
      }
      let api = `/blog/post/${blogId}/${postId}`;
      if (state) {
        api += `?state=${state}`;
      }
      const entcoreBlogPost = await sessionFetch.json<IEntcoreBlogPost>(api);
      // Run the adapter for the received blog post
      return blogPostAdapter(entcoreBlogPost);
    },
    publish: async (session: AuthActiveAccount, blogId: string, postId: string) => {
      const api = `/blog/post/publish/${blogId}/${postId}`;
      return sessionFetch.json<{ number: number }>(api, { method: 'PUT' });
    },
    submit: async (session: AuthActiveAccount, blogId: string, postId: string) => {
      const api = `/blog/post/submit/${blogId}/${postId}`;
      return sessionFetch.json<{ number: number }>(api, { method: 'PUT' });
    },
  },
  posts: {
    get: async (session: AuthActiveAccount, blogId: string, state?: string | string[]) => {
      let stateAsArray: string[] | undefined;
      if (typeof state === 'string') stateAsArray = [state];
      else stateAsArray = state;
      let api = `/blog/post/list/all/${blogId}?content=true`;
      if (stateAsArray) api += `&states=${stateAsArray.join(',')}`;
      const entcoreBlogPostList = await sessionFetch.json<IEntcoreBlogPostList>(api);
      const blogPosts = entcoreBlogPostList.map(bp => blogPostAdapter(bp));
      return blogPosts;
    },
    page: async (session: AuthActiveAccount, blogId: string, page: number, state?: string | string[]) => {
      // Compute state parameter
      let stateAsArray: string[] | undefined;
      if (typeof state === 'string') stateAsArray = [state];
      else stateAsArray = state;
      // Call API
      let api = `/blog/post/list/all/${blogId}?content=true&page=${page}`;
      if (stateAsArray) api += `&states=${stateAsArray.join(',')}`;
      const entcoreBlogPostList = await sessionFetch.json<IEntcoreBlogPostList>(api);
      const blogPosts = entcoreBlogPostList.map(bp => blogPostAdapter(bp));
      return blogPosts;
    },
  },
};
