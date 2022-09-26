import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { mementoService } from '~/modules/viescolaire/presences/services/memento';
import { IMemento, actionTypes } from '~/modules/viescolaire/presences/state/memento';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IMemento>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchMementoAction(studentId: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await mementoService.get(studentId);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
