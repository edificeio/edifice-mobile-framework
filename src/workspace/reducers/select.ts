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
import {actionTypesDownload} from "../actions/download";

export type IItems<T> = {
  [key: string]: T;
};

const initialState = {};

export default (state: IItems<IItem> = initialState, action: IAction<IItem>) => {
  switch (action.type) {
    case actionTypesDownload.received:
    case actionTypesDelete.received:
    case actionTypesPast.received:
    case actionTypesUpload.received:
    case actionTypesRename.received:
      return {};
    case SELECT_ACTION_TYPE:
      if (state[action.data.id]) {
        delete state[action.data.id];
        return { ...state };
      }
      return {
        ...state,
        [action.data.id]: action.data,
      };
    case SELECT_CLEAR_ACTION_TYPE:
      return initialState;
    default:
      return state;
  }
};
