import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { quotaService } from '~/modules/zimbra/service/quota';
import { IQuota, actionTypes } from '~/modules/zimbra/state/quota';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IQuota>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchQuotaAction() {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await quotaService.get();
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
