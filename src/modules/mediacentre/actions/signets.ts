import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { signetsService } from '~/modules/mediacentre/services/signets';
import { ISignets, actionTypes } from '~/modules/mediacentre/state/signets';

// ACTION LIST ------------------------------------------------------------------------------------

const dataActions = createAsyncActionCreators<ISignets>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchSignetsAction(userId: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const sharedSignets = await signetsService.get(userId);
      const orientationSignets = await signetsService.getOrientation();
      dispatch(dataActions.receipt({ orientationSignets, sharedSignets }));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
