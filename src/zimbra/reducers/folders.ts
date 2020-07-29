import { createSessionAsyncReducer } from "../../infra/redux/async2";
import { initialState, actionTypes, postFolderType } from "../state/folders";

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, actionTypes, {
  [postFolderType]: (state, action) => {
    const newState = [...state];
    newState.push({
      name: action.data.name,
      parent_id: action.data.parent_id,
      trashed: false,
      depth: 1,
    });
    return newState;
  },
});
