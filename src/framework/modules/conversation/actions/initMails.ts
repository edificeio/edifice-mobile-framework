import { Dispatch } from 'redux';

import { initMailService } from '~/framework/modules/conversation/service/initMails';
import { actionTypes, IInitMail } from '~/framework/modules/conversation/state/initMails';
import { createAsyncActionCreators } from '~/infra/redux/async2';

export const dataActions = createAsyncActionCreators<IInitMail>(actionTypes);

export function fetchInitAction() {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await initMailService.get();
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg as Error));
    }
  };
}
