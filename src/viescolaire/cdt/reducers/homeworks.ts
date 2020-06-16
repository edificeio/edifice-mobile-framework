import { initialState, listActionTypes, updateActionTypes } from "../state/homeworks";

// THE REDUCER ------------------------------------------------------------------------------------

const homeworksReducer = (
    state: any = initialState,
    action
  ) => {
    switch (action.type) {
      case listActionTypes.request:
        return {
          ...state,
          isFetching: true,
        };
      case listActionTypes.receipt:
        let result = action.data.reduce((obj, item) => (obj[item.id] = item, obj) ,{});
        return {
          ...state,
          data: result,
          isFetching: false,
          isPristine: false,
        };
      case updateActionTypes.request:
        return {
          ...state,
          isFetching: true,
        };
      case updateActionTypes.receipt:
        let stateUpdated = {...state};
        stateUpdated.data[action.data.homeworkId].progress.state_label = action.data.status;
        stateUpdated.data[action.data.homeworkId].progress.state_id = action.data.status === 'todo' ? 1 : 2;
        return { 
          ...stateUpdated,
          isFetching: false,
          isPristine: false,
        };
      default:
        return state;
    }
  };

export default homeworksReducer;
