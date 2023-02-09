import { Dispatch } from 'redux';

import { subjectListService } from '~/framework/modules/viescolaire/dashboard/services/subjects';
import { ISubjectList, actionTypes } from '~/framework/modules/viescolaire/dashboard/state/subjects';
import { createAsyncActionCreators } from '~/infra/redux/async2';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<ISubjectList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchSubjectListAction(structureId: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await subjectListService.get(structureId);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
