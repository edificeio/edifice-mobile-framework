/**
 * Blog actions
 */
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import { assertSession } from '~/framework/modules/auth/reducer';
import { actionTypes, Blog, BlogFolder, BlogPost, getPublishableBlogs } from '~/framework/modules/blog/reducer';
import {
  createBlogPostResourceRight,
  getBlogPostRight,
  publishBlogPostResourceRight,
  submitBlogPostResourceRight,
} from '~/framework/modules/blog/rights';
import { blogService } from '~/framework/modules/blog/service';
import workspaceFileTransferActions from '~/framework/modules/workspace/actions/fileTransfer';
import { LocalFile } from '~/framework/util/fileHandler';
import { createAsyncActionCreators } from '~/framework/util/redux/async';
import { resourceHasRight } from '~/framework/util/resourceRights';

/**
 * Fetch the details of a given blog post.
 * Info: no reducer is used in this action.
 */
export const getBlogPostDetailsAction =
  (blogPostId: { blogId: string; postId: string }, blogPostState?: string) =>
  async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      const session = assertSession();

      // Get blog post and comments
      const [blogPost, blogPostComments] = await Promise.all([
        blogService.post.get(session, blogPostId, blogPostState),
        blogService.comments.get(session, blogPostId),
      ]);
      const blogPostWithComments = {
        ...blogPost,
        comments: blogPostComments,
      };
      return blogPostWithComments;
    } catch {
      // ToDo: Error handling
    }
  };

/**
 * Fetch the posts of a given blog.
 */
export const blogPostsActionsCreators = createAsyncActionCreators(actionTypes.blogPosts);
export const fetchBlogPostsAction =
  (blogId: string): ThunkAction<Promise<BlogPost[]>, any, any, any> =>
  async (dispatch, getState) => {
    try {
      const session = assertSession();
      dispatch(blogPostsActionsCreators.request());
      const blogPosts = await blogService.posts.get(session, blogId);
      dispatch(blogPostsActionsCreators.receipt(blogPosts));
      return blogPosts;
    } catch (e) {
      dispatch(blogPostsActionsCreators.error(e as Error));
      throw e;
    }
  };

/**
 * Fetch the user's publishable blog list.
 * Info: no reducer is used in this action.
 */
export const getPublishableBlogListAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  try {
    const session = assertSession();

    const allBlogs = await blogService.list(session);
    const publishableBlogs = getPublishableBlogs(session, allBlogs);
    return publishableBlogs;
  } catch {
    // ToDo: Error handling
  }
};

export const getBlogsAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  const session = assertSession();
  const ret = await Promise.all([blogService.list(session), blogService.folders.list(session)]);
  return { blogs: ret[0], folders: ret[1] };
};

export const uploadBlogPostImagesAction =
  (images: LocalFile[], isPublic: boolean) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    return dispatch(
      workspaceFileTransferActions.uploadFilesAction(
        images,
        isPublic
          ? {
              public: true,
            }
          : {
              parent: 'protected',
            }
      )
    );
  };

/**
 * Create a post for a given blog.
 * Info: no reducer is used in this action.
 */
export const createBlogPostAction =
  (blogId: string, postTitle: string, postContent: string) =>
  async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    const session = assertSession();

    const createdPost = await blogService.post.create(session, blogId, postTitle, postContent);
    const postId = createdPost._id;
    return postId;
  };

/**
 * Publish a created post for a given blog.
 * Info: no reducer is used in this action.
 */
export const publishBlogPostAction =
  (blogId: string, postId: string) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      const session = assertSession();
      return await blogService.post.publish(session, blogId, postId);
    } catch {
      // ToDo: Error handling
    }
  };

/**
 * Submit a created post for a given blog.
 * Info: no reducer is used in this action.
 */
export const submitBlogPostAction =
  (blogId: string, postId: string) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      const session = assertSession();
      return await blogService.post.submit(session, blogId, postId);
    } catch {
      // ToDo: Error handling
    }
  };

/**
 * Edit a post for a given blog.
 * Info: no reducer is used in this action.
 */
export const editBlogPostAction =
  (blog: Blog, postId: string, postTitle: string, postContent: string, postState: string) =>
  async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    const session = assertSession();
    const blogId = blog.id;
    const blogPostRight = getBlogPostRight(blog, session);
    if (!blogPostRight) {
      throw new Error('[editBlogPostAction] user has no post rights for this blog');
    }

    await blogService.post.edit(session, blogId, postId, postTitle, postContent);
    const hasPublishBlogPostRight = resourceHasRight(blog, publishBlogPostResourceRight, session);
    if (!hasPublishBlogPostRight || postState === 'SUBMITTED') await blogService.post.submit(session, blogId, postId);
    else await blogService.post.publish(session, blogId, postId);
  };

/**
 * Create and submit/publish a post for a given blog.
 * Info: no reducer is used in this action.
 */
export const sendBlogPostAction =
  (blog: Blog, postTitle: string, postContent: string) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    const session = assertSession();
    const blogId = blog.id;
    const blogPostRight = getBlogPostRight(blog, session);
    if (!blogPostRight) {
      throw new Error('[sendBlogPostAction] user has no post rights for this blog');
    }

    // Create post
    const postId = (await dispatch(createBlogPostAction(blogId, postTitle, postContent))) as unknown as string;

    // Submit or publish post
    if (!postId) {
      throw new Error('[sendBlogPostAction] failed to access id of created post');
    }
    const blogPostActionRight = blogPostRight.actionRight;
    const shareAction = {
      [createBlogPostResourceRight]: undefined,
      [publishBlogPostResourceRight]: () => dispatch(publishBlogPostAction(blogId, postId)) as unknown as Promise<string>,
      [submitBlogPostResourceRight]: () => dispatch(submitBlogPostAction(blogId, postId)) as unknown as Promise<string>,
    }[blogPostActionRight];
    if (shareAction) await shareAction();
  };

/**
 * Delete a blog post.
 * Info: no reducer is used in this action.
 */
export const deleteBlogPostAction = (blogPostId: { blogId: string; postId: string }) => async () => {
  try {
    const session = assertSession();
    return await blogService.post.delete(session, blogPostId);
  } catch {
    // ToDo: Error handling
  }
};

/**
 * Publish a comment for a given blog post.
 * Info: no reducer is used in this action.
 */
export const publishBlogPostCommentAction =
  (blogPostId: { blogId: string; postId: string }, comment: string) =>
  async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      const session = assertSession();
      return await blogService.comments.publish(session, blogPostId, comment);
    } catch {
      // ToDo: Error handling
    }
  };

/**
 * Update a comment for a given blog post.
 * Info: no reducer is used in this action.
 */
export const updateBlogPostCommentAction =
  (blogPostCommentId: { blogId: string; postId: string; commentId: string }, comment: string) =>
  async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      const session = assertSession();
      return await blogService.comments.update(session, blogPostCommentId, comment);
    } catch {
      // ToDo: Error handling
    }
  };

/**
 * Delete a comment for a given blog post.
 * Info: no reducer is used in this action.
 */
export const deleteBlogPostCommentAction =
  (blogPostCommentId: { blogId: string; postId: string; commentId: string }) =>
  async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      const session = assertSession();
      return await blogService.comments.delete(session, blogPostCommentId);
    } catch {
      // ToDo: Error handling
    }
  };

/**
 * These are actions to fetch and populate Blog main reducer.
 */
export const blogFoldersActionsCreators = createAsyncActionCreators(actionTypes.folders);
export const fetchBlogFoldersAction = (): ThunkAction<Promise<BlogFolder[]>, any, any, any> => async (dispatch, getState) => {
  try {
    const session = assertSession();
    dispatch(blogFoldersActionsCreators.request());
    const res = await blogService.folders.list(session);
    dispatch(blogFoldersActionsCreators.receipt(res));
    return res;
  } catch (e) {
    dispatch(blogFoldersActionsCreators.error(e as Error));
    throw e;
  }
};
export const blogActionsCreators = createAsyncActionCreators(actionTypes.blogs);
export const fetchBlogsAction = (): ThunkAction<Promise<Blog[]>, any, any, any> => async (dispatch, getState) => {
  try {
    const session = assertSession();
    dispatch(blogActionsCreators.request());
    const res = await blogService.list(session);
    dispatch(blogActionsCreators.receipt(res));
    return res;
  } catch (e) {
    dispatch(blogActionsCreators.error(e as Error));
    throw e;
  }
};
export const fetchBlogsAndFoldersAction =
  (): ThunkAction<Promise<[Blog[], BlogFolder[]]>, any, any, any> => async (dispatch, getState) => {
    const data = await Promise.all([dispatch(fetchBlogsAction()), dispatch(fetchBlogFoldersAction())]);
    // ToDo : call line below when tha case of trashed blogs will be handled
    await dispatch({ blogs: data[0], folders: data[1], type: actionTypes.tree.compute });
    return data;
  };
