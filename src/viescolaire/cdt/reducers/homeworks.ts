import { createSessionAsyncReducer } from "../../../infra/redux/async2";
import { initialState, listActionTypes, updateActionTypes } from "../state/homeworks";

// THE REDUCER ------------------------------------------------------------------------------------

const reducerActionsMap = {
  [updateActionTypes.receipt]: (state, action) => {
    let stateUpdated = Object.assign({}, state);
    if(stateUpdated[action.data.homeworkId].progress === null) stateUpdated[action.data.homeworkId].progress = {};
    stateUpdated[action.data.homeworkId].progress.state_label = action.data.status;
    stateUpdated[action.data.homeworkId].progress.state_id = action.data.status === "todo" ? 1 : 2;
    action.data = stateUpdated;
    return { ...stateUpdated };
  },
};

export default createSessionAsyncReducer(initialState, listActionTypes, reducerActionsMap);
