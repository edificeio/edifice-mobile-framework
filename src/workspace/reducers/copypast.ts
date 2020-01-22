/**
 * Workspace selection state reducer
 * Holds a list of selected item in a simple Array
 */
import { actionTypesPast, COPY_ACTION_TYPE, COPY_CLEAR_ACTION_TYPE, CUT_ACTION_TYPE } from "../actions/copypast";
import { IAction } from "../../infra/redux/async";
import { ICopyPast } from "../types/states";

const initialState = {
  selected: {},
  cut: false,
};

export default (state: ICopyPast = initialState, action: IAction<any>) => {
  switch (action.type) {
    case COPY_ACTION_TYPE:
      return {
        selected: action.payload.selected,
        cut: false,
      };
    case CUT_ACTION_TYPE:
      return {
        selected: action.payload.selected,
        cut: true,
      };
    case actionTypesPast.received:
    case COPY_CLEAR_ACTION_TYPE:
      return initialState;
    default:
      return state;
  }
};
