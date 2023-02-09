import { Dispatch } from 'redux';

import { groupListService } from '~/framework/modules/viescolaire/dashboard/services/group';
import { IGroupList, actionTypes } from '~/framework/modules/viescolaire/dashboard/state/group';
import { createAsyncActionCreators } from '~/infra/redux/async2';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IGroupList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchGroupListAction(classes: string, student: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await groupListService.get(classes, student);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
