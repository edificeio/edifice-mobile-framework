/**
 * Blog comments list state reducer
 */

import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, blogCommentListActionTypes } from '~/timeline/state/commentList';

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, blogCommentListActionTypes);
