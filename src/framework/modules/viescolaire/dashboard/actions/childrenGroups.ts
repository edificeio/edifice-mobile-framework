import { Dispatch } from 'redux';

import { childrenGroupsService } from '~/framework/modules/viescolaire/dashboard/services/childrenGroups';
import { IChildrenGroups, actionTypes } from '~/framework/modules/viescolaire/dashboard/state/childrenGroups';
import { createAsyncActionCreators } from '~/infra/redux/async2';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IChildrenGroups>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchChildrenGroupsAction(idStructure: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await childrenGroupsService.get(idStructure);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
