/**
 * Publishable blogs list state reducer
 */

import { initialState } from "../state/publishableBlogs";
import { publishableBlogsActionTypes, blogPublishActionTypes } from "../state/publishableBlogs";
import { createSessionAsyncReducer } from "../../infra/redux/async2";
import { AnyAction } from "redux";
import { createSessionReducer } from "../../infra/redux/reducerFactory";

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, publishableBlogsActionTypes);

export const publishStatusReducer: (state: { publishing: boolean }, action: AnyAction) => { publishing: boolean }
  = createSessionReducer<{ publishing: boolean }>(
    { publishing: false },
    {
      [blogPublishActionTypes.request]: (state, action) => ({ publishing: true }),
      [blogPublishActionTypes.receipt]: (state, action) => ({ publishing: false }),
      [blogPublishActionTypes.error]:   (state, action) => ({ publishing: false }),
    }
  )
