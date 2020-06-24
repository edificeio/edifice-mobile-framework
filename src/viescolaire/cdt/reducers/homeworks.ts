import { createSessionAsyncReducer } from "../../../infra/redux/async2";
import { initialState, listActionTypes, updateActionTypes } from "../state/homeworks";

// THE REDUCER ------------------------------------------------------------------------------------

const actionTypes = {
  ...listActionTypes,
  updateReceipt: updateActionTypes.receipt,
};

const reducerActionsMap = {
  [actionTypes.updateReceipt]: (state, action) => {
    let stateUpdated = Object.assign({}, state);
    stateUpdated[action.data.homeworkId].progress.state_label = action.data.status;
    stateUpdated[action.data.homeworkId].progress.state_id = action.data.status === "todo" ? 1 : 2;
    action.data = stateUpdated;
    return { ...stateUpdated };
  },
};

export default createSessionAsyncReducer(initialState, actionTypes, reducerActionsMap);
