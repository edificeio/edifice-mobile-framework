import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { textbooksService } from '~/modules/mediacentre/services/textbooks';
import { ITextbooks, actionTypes } from '~/modules/mediacentre/state/textbooks';

// ACTION LIST ------------------------------------------------------------------------------------

const dataActions = createAsyncActionCreators<ITextbooks>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchTextbooksAction() {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await textbooksService.get();
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
