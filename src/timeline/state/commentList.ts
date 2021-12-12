import moment from 'moment';

import { createAsyncActionTypes, AsyncState } from '~/infra/redux/async2';

// THE MODEL --------------------------------------------------------------------------------------

export interface IBlogComment {
  id: string;
  comment: string;
  state: string;
  author: {
    userId: string;
    username: string;
    login: string;
  };
  created: moment.Moment;
}

export type IBlogCommentList = IBlogComment[];

// THE STATE --------------------------------------------------------------------------------------

export type IBlogCommentListState = AsyncState<IBlogCommentList>;

export const initialState: IBlogCommentList = [];

/** Returns the sub local state (global state -> notification -> notificationList). Give the global state as parameter. */
export const getBlogCommentListState = (globalState: any) => globalState.timeline.selectedBlogComments as IBlogCommentListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const blogCommentListActionTypes = createAsyncActionTypes('TIMELINE_BLOG_COMMENT_LIST');
