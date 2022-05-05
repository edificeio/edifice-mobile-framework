import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { searchService } from '~/modules/mediacentre/services/search';
import { IExternals, actionTypes } from '~/modules/mediacentre/state/externals';

// ACTION LIST ------------------------------------------------------------------------------------

const dataActions = createAsyncActionCreators<IExternals>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchExternalsAction(sources: string[]) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await searchService.getExternals(sources);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
