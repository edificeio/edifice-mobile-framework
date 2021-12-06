import { Dispatch } from 'redux';

import { createAsyncActionCreators } from '~/infra/redux/async2';
import { ServicesMatiereListService } from '~/modules/viescolaire/competences/services/servicesMatieres';
import { actionTypes, IServiceList } from '~/modules/viescolaire/competences/state/servicesMatieres';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IServiceList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

export function fetchServicesMatieresAction(structureId: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.clear());
      dispatch(dataActions.request());
      const data = await ServicesMatiereListService.getServices(structureId);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}
