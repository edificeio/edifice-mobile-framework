import type { Dispatch } from 'redux';

import { IGlobalState } from '~/app/store';
import { assertSession } from '~/framework/modules/auth/reducer';
import { visiblesService } from '~/framework/modules/conversation/service/visibles';
import { IVisibles, actionTypes } from '~/framework/modules/conversation/state/visibles';
import { createAsyncActionCreators } from '~/framework/util/redux/async';

export const dataActions = createAsyncActionCreators<IVisibles>(actionTypes);

export function fetchVisiblesAction() {
  return async (dispatch: Dispatch, getState: () => IGlobalState) => {
    try {
      dispatch(dataActions.request());
      const session = assertSession();
      const data = await visiblesService.get(session);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(new Error(errmsg as string)));
    }
  };
}
