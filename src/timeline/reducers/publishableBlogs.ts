/**
 * Publishable blogs list state reducer
 */

import { AnyAction } from 'redux';

import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { createSessionReducer } from '~/infra/redux/reducerFactory';
import { initialState, publishableBlogsActionTypes, blogPublishActionTypes } from '~/timeline/state/publishableBlogs';

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, publishableBlogsActionTypes);

export const publishStatusReducer: (state: { publishing: boolean }, action: AnyAction) => { publishing: boolean } =
  createSessionReducer<{ publishing: boolean }>(
    { publishing: false },
    {
      [blogPublishActionTypes.request]: (state, action) => ({ publishing: true }),
      [blogPublishActionTypes.receipt]: (state, action) => ({ publishing: false }),
      [blogPublishActionTypes.error]: (state, action) => ({ publishing: false }),
    },
  );
