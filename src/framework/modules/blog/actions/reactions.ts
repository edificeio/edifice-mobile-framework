import { ThunkDispatch } from 'redux-thunk';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { blogService } from '~/framework/modules/blog/service';

/**
 * Get reactions for blog post by id
 */
export const getReactionsBlogPost = (blogPostId: string) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  return blogService.audience.reactions.get(blogPostId);
};

/**
 * Post reaction to blog post by active session
 */
export const postReactionBlogPost =
  (session: AuthActiveAccount, blogPostId: string, reaction: string) =>
  async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    return blogService.audience.reactions.post(session, blogPostId, reaction);
  };

/**
 * Edit reaction to blog post by active session
 */
export const editReactionBlogPost =
  (session: AuthActiveAccount, blogPostId: string, reaction: string) =>
  async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    return blogService.audience.reactions.update(session, blogPostId, reaction);
  };

/**
 * Delete reaction to blog post by active session
 */
export const deleteReactionBlogPost =
  (session: AuthActiveAccount, blogPostId: string) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    return blogService.audience.reactions.delete(session, blogPostId);
  };
