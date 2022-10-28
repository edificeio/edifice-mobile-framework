import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { personnelListService } from '~/modules/viescolaire/dashboard/services/personnel';
import { IPersonnelList, actionTypes } from '~/modules/viescolaire/dashboard/state/personnel';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IPersonnelList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchPersonnelListAction(structureId: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await personnelListService.get(structureId);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
