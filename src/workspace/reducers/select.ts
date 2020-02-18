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
import { actionTypesDownload } from "../actions/download";
import { actionTypesPast } from "../actions/past";
import { actionTypesMove } from "../actions/move";
import { actionTypesRestore } from "../actions/restore";

export type IItems<T> = {
  [key: string]: T;
};

const initialState = {};

export default (state: IItems<IItem> = initialState, action: IAction<IItem>) => {
  switch (action.type) {
    case SELECT_ACTION_TYPE:
      if (state[action.data.id]) {
        delete state[action.data.id];
        return { ...state };
      }
      return {
        ...state,
        [action.data.id]: action.data,
      };
    case actionTypesDownload.received:
    case actionTypesDelete.received:
    case actionTypesRestore.received:
    case actionTypesPast.received:
    case actionTypesMove.received:
    case actionTypesUpload.received:
    case actionTypesRename.received:
    case SELECT_CLEAR_ACTION_TYPE:
      return initialState;
    default:
      return state;
  }
};
