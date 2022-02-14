import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { classesCallService } from '~/modules/viescolaire/presences/services/teacherClassesCall';
import { IClassesCall, actionTypes } from '~/modules/viescolaire/presences/state/teacherClassesCall';

export const dataActions = createAsyncActionCreators<IClassesCall>(actionTypes);

export function fetchClassesCallAction(callId) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.clear());
      dispatch(dataActions.request());
      const data = await classesCallService.get(callId);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
