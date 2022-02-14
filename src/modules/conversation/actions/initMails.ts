import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { initMailService } from '~/modules/conversation/service/initMails';
import { IInitMail, actionTypes } from '~/modules/conversation/state/initMails';

export const dataActions = createAsyncActionCreators<IInitMail>(actionTypes);

export function fetchInitAction() {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await initMailService.get();
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
