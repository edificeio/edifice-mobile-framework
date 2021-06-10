import { Dispatch } from "redux";

import { createAsyncActionCreators } from "../../../../infra/redux/async2";
import { ServicesMatiereListService } from "../services/servicesMatieres";
import { actionTypes, IServiceList } from "../state/servicesMatieres";

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
