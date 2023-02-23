import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { mailContentService } from '~/modules/conversation/service/mailContent';
import { actionTypes, IMail } from '~/modules/conversation/state/mailContent';

// ACTION LIST ------------------------------------------------------------------------------------

const dataActions = createAsyncActionCreators<IMail>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchMailContentAction(mailId) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await mailContentService.get(mailId);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}

export function clearMailContentAction() {
  return async (dispatch: Dispatch) => {
    dispatch(dataActions.clear());
  };
}
