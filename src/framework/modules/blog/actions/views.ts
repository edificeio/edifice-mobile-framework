import { ThunkDispatch } from 'redux-thunk';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { blogService } from '~/framework/modules/blog/service';

/**
 * Get views for blog post by id
 */
export const getViewsBlogPost = (blogPostId: string) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  return blogService.audience.views.get(blogPostId);
};

/**
 * Get views for many blog post by id
 */
export const getViewsManyBlogPost =
  (blogPostIds: string[]) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    return blogService.audience.views.getForManyPosts(blogPostIds);
  };

/**
 * Post view to blog post by active session
 */
export const postViewBlogPost =
  (session: AuthActiveAccount, blogPostId: string) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    return blogService.audience.views.post(session, blogPostId);
  };
