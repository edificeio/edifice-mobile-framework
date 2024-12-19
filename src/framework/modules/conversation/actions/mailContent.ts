import { Dispatch } from 'redux';

import { mailContentService } from '~/framework/modules/conversation/service/mailContent';
import { actionTypes, IMail } from '~/framework/modules/conversation/state/mailContent';
import { createAsyncActionCreators } from '~/infra/redux/async2';

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
      dispatch(dataActions.error(errmsg as Error));
    }
  };
}

export function clearMailContentAction() {
  return async (dispatch: Dispatch) => {
    dispatch(dataActions.clear());
  };
}
