import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { subjectListService } from '~/modules/viescolaire/dashboard/services/subjects';
import { ISubjectList, actionTypes } from '~/modules/viescolaire/dashboard/state/subjects';

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
