import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { foldersService } from '~/modules/conversation/service/folders';
import { ICountMailboxes, actionTypes } from '~/modules/conversation/state/count';

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
