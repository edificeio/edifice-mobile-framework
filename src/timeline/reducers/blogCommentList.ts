/**
 * Blog comments list state reducer
 */

import { initialState } from "../state/commentList";
import { blogCommentListActionTypes } from "../state/commentList";
import { createSessionAsyncReducer } from "../../infra/redux/async2";

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, blogCommentListActionTypes);
