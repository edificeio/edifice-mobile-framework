/**
 * Workspace state reducer
 * Holds a list of simple element in a simple Array
 */
import asyncReducer, { IAction } from "../../infra/redux/async";

import { actionTypesList } from "../actions/list";
import { actionTypesCreateFolder } from "../actions/create";
import { actionTypesRename } from "../actions/rename";
import { IItem, IItems, IState } from "../types";
import { actionTypesPast } from "../actions/copypast";
import { actionTypesUpload } from "../actions/upload";
import { actionTypesDelete } from "../actions/delete";

const stateDefault: IState = {
  isFetching: false,
  data: {},
};

export default (state: IState = stateDefault, action: IAction<IItems<IItem | string>>) => {
  switch (action.type) {
    case actionTypesDelete.fetchError:
    case actionTypesDelete.requested:
    case actionTypesDelete.received:
      return pushData(state, action, actionTypesDelete);
    //    case actionTypesUpload.fetchError:    // there is progress bar, so yourglass unnecessary
    //    case actionTypesUpload.requested:
    case actionTypesUpload.received:
      return pushData(state, action, actionTypesUpload);
    case actionTypesCreateFolder.fetchError:
    case actionTypesCreateFolder.requested:
    case actionTypesCreateFolder.received:
      return pushData(state, action, actionTypesCreateFolder);
    case actionTypesPast.fetchError:
    case actionTypesPast.requested:
    case actionTypesPast.received:
      return pushData(state, action, actionTypesPast);
    case actionTypesList.fetchError:
    case actionTypesList.requested:
    case actionTypesList.received:
      return pushData(state, action, actionTypesList);
    case actionTypesRename.fetchError:
    case actionTypesRename.requested:
    case actionTypesRename.received:
      return pushData(state, action, actionTypesRename);
    default:
      return state;
  }
};

function pushData(state: IState, action: IAction<IItems<IItem | string>>, actionTypes) {
  return {
    isFetching: false,
    data: {
      ...state.data,
      [action.payload.parentId]: asyncReducer<IItems<IItem>>(node, actionTypes)(
        state.data[action.payload.parentId],
        action
      ),
    },
  };
}

const node = (data: IItems<IItem> = {}, action: IAction<IItems<IItem | string>>): IItems<IItem> => {
  switch (action.type) {
    case actionTypesDelete.received:
      for (const id in action.data as IItems<string>) delete data[id];
      return { ...data };
    case actionTypesUpload.received:
    case actionTypesRename.received:
    case actionTypesPast.received:
    case actionTypesCreateFolder.received:
      return {
        ...data,
        ...(action.data as IItems<IItem>),
      };
    case actionTypesList.received:
      return action.data as IItems<IItem>;
    default:
      return data;
  }
};
