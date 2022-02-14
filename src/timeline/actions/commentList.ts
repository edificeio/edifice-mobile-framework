/**
 * Comment list actions
 * Build actions to be dispatched to the comment list reducer.
 */

import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { blogCommentListService } from '~/timeline/service/commentList';
import { IBlogCommentList, blogCommentListActionTypes } from '~/timeline/state/commentList';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IBlogCommentList>(blogCommentListActionTypes);

// THUNKS -----------------------------------------------------------------------------------------

/**
 * Calls a fetch operation to get blog comment list from the backend.
 * Dispatches COMMENT_LIST_REQUESTED, COMMENT_LIST_RECEIVED, and COMMENT_LIST_FETCH_ERROR if an error occurs.
 */
export function fetchBlogCommentListAction(blogPostId: string, clear: boolean = false) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await blogCommentListService.get(blogPostId);
      clear && dispatch(dataActions.clear());
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}

/**
 * Calls a fetch operation to get news comment list from the backend.
 * Dispatches ...
 */
