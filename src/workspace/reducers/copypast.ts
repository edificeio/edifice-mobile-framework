/**
 * Workspace selection state reducer
 * Holds a list of selected item in a simple Array
 */
import {actionTypesPast, COPY_ACTION_TYPE, COPY_CLEAR_ACTION_TYPE} from "../actions/copypast";
import { IAction } from "../../infra/redux/async";
import { IItem } from "../types/states";

export default (state: Array<IItem> = [], action: IAction<any>) => {
  switch (action.type) {
    case COPY_ACTION_TYPE:
      return action.payload;
    case actionTypesPast.received:
    case COPY_CLEAR_ACTION_TYPE:
      return {};
    default:
      return state;
  }
};
