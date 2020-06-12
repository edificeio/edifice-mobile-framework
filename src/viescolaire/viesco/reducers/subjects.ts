import { createSessionAsyncReducer } from "../../../infra/redux/async2";
import { initialState, actionTypes } from "../state/subjects";

// THE REDUCER ------------------------------------------------------------------------------------

const subjectsReducer = (
    state: any = initialState,
    action
  ) => {
    switch (action.type) {
      case actionTypes.received:
        return {
          ...state,
          ...action.data
        };
      default:
        return state;
    }
  };

export default createSessionAsyncReducer(subjectsReducer, actionTypes);
