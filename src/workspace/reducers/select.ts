/**
 * Workspace selection state reducer
 * Holds a list of selected item in a simple Array
 */
import { SELECT_ACTION_TYPE, SELECT_CLEAR_ACTION_TYPE } from "../actions/select";
import { IItem } from "../types";
import { IAction } from "../../infra/redux/async";
import { IId } from "../../types";

export type ISelectState<T> = {
  [key: string]: T;
};

export default (state: ISelectState<IItem> = {}, action: IAction<IItem> & IId) => {
  switch (action.type) {
    case SELECT_CLEAR_ACTION_TYPE:
      return {};
    case SELECT_ACTION_TYPE:
      if (action.id === "") {
        return {};
      }
      if (state[action.id]) {
        delete state[action.id];
        return { ...state };
      }
      return {
        ...state,
        [action.id]: action.data,
      };
    default:
      return state;
  }
};
