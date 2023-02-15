import { Dispatch } from 'redux';

import { personnelListService } from '~/framework/modules/viescolaire/dashboard/services/personnel';
import { IPersonnelList, actionTypes } from '~/framework/modules/viescolaire/dashboard/state/personnel';
import { createAsyncActionCreators } from '~/framework/util/redux/async';

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
