import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { LevelsService } from '~/modules/viescolaire/competences/services/competencesLevels';
import { ILevelsList, actionTypes } from '~/modules/viescolaire/competences/state/competencesLevels';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<ILevelsList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchLevelsAction(structureId: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.clear());
      dispatch(dataActions.request());
      const data = await LevelsService.getLevels(structureId);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
