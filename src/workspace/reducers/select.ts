/**
 * Workspace selection state reducer
 * Holds a list of selected item in a simple Array
 */
import { SELECT_ACTION_TYPE, SELECT_CLEAR_ACTION_TYPE } from "../actions/select";
import { IItem } from "../types";
import { IAction } from "../../infra/redux/async";
import { actionTypesDelete } from "../actions/delete";
import { actionTypesUpload } from "../actions/upload";
import { actionTypesRename } from "../actions/rename";
import { actionTypesPast } from "../actions/copypast";

export type ISelectState<T> = {
  [key: string]: T;
};

const initialState = {};

export default (state: ISelectState<IItem> | { empty: boolean} = initialState, action: IAction<IItem>) => {
  switch (action.type) {
    case actionTypesDelete.received:
    case actionTypesPast.received:
    case actionTypesUpload.received:
    case actionTypesRename.received:
      return {};
    case SELECT_ACTION_TYPE:
      if (action.payload.id === "") {
        return initialState;
      }
      if (state[action.payload.id]) {
        delete state[action.payload.id];
        return { ...state };
      }
      return {
        ...state,
        [action.payload.id]: action.payload,
      };
    case SELECT_CLEAR_ACTION_TYPE:
      return initialState
    default:
      return state;
  }
};
