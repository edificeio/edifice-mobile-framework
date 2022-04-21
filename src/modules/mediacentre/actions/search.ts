import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { AdvancedSearchParams } from '~/modules/mediacentre/components/AdvancedSearchModal';
import { searchService } from '~/modules/mediacentre/services/search';
import { ISearch, actionTypes } from '~/modules/mediacentre/state/search';

// ACTION LIST ------------------------------------------------------------------------------------

const dataActions = createAsyncActionCreators<ISearch>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function searchResourcesAction(query: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await searchService.getSimple(query);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}

export function searchResourcesAdvancedAction(params: AdvancedSearchParams) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await searchService.getAdvanced(params);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
