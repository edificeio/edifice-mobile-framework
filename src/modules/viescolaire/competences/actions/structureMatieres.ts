import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { StructureMatiereListService } from '~/modules/viescolaire/competences/services/structureMatieres';
import { IStructureMatiereList, actionTypes } from '~/modules/viescolaire/competences/state/structureMatieres';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IStructureMatiereList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchStructureMatieresAction(structureId: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.clear());
      dispatch(dataActions.request());
      const data = await StructureMatiereListService.getStructureMatiereList(structureId);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
