/**
 * Workspace selection state reducer
 * Holds a list of selected item in a simple Array
 */
import { SELECT_ACTION_TYPE, SELECT_CLEAR_ACTION_TYPE } from "../actions/select";
import { IItem } from "../types";
import { IAction } from "../../infra/redux/async";
import {actionTypesDelete} from "../actions/delete";
import {actionTypesUpload} from "../actions/upload";
import {actionTypesRename} from "../actions/rename";
import {actionTypesCreateFolder} from "../actions/create";
import {actionTypesPast} from "../actions/copypast";

export type ISelectState<T> = {
  [key: string]: T;
};

export default (state: ISelectState<IItem> = {}, action: IAction<IItem>) => {
  switch (action.type) {
    case actionTypesDelete.received:
    case actionTypesPast.received:
    case actionTypesUpload.received:
    case actionTypesRename.received:
    case actionTypesCreateFolder.received:
      return {};
    case SELECT_ACTION_TYPE:
      if (action.payload.id === "") {
        return {};
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
      return {};
    default:
      return state;
  }
};
