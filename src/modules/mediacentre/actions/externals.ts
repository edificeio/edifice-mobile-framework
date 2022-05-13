import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { searchService } from '~/modules/mediacentre/services/search';
import { IExternals, actionTypes } from '~/modules/mediacentre/state/externals';
import { Source } from '~/modules/mediacentre/utils/Resource';

// ACTION LIST ------------------------------------------------------------------------------------

const dataActions = createAsyncActionCreators<IExternals>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchExternalsAction(sources: string[]) {
  return async (dispatch: Dispatch) => {
    if (!sources.includes(Source.GAR)) {
      return;
    }
    try {
      dispatch(dataActions.request());
      const data = await searchService.getSimple([Source.GAR], '.*');
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
