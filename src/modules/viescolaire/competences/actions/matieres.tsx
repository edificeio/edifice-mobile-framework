import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { MatieresService } from '~/modules/viescolaire/competences/services/matieres';
import { IMatiereList, actionTypes } from '~/modules/viescolaire/competences/state/matieres';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IMatiereList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchMatieresAction(studentId: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.clear());
      dispatch(dataActions.request());
      const data = await MatieresService.getMatieres(studentId);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
