import { Dispatch } from 'redux';

import { foldersService } from '~/framework/modules/conversation/service/folders';
import { ICountMailboxes, actionTypes } from '~/framework/modules/conversation/state/count';
import { createAsyncActionCreators } from '~/infra/redux/async2';

export const dataActions = createAsyncActionCreators<ICountMailboxes>(actionTypes);

export function fetchCountAction() {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await foldersService.count();
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
