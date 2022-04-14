import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { searchService } from '~/modules/mediacentre/services/search';
import { actionTypes, IGarResources } from '~/modules/mediacentre/state/garResources';

// ACTION LIST ------------------------------------------------------------------------------------

const dataActions = createAsyncActionCreators<IGarResources>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchGarResourcesAction() {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await searchService.getGar();
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
