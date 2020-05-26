/* eslint-disable no-fallthrough */
/**
 * Workspace state reducer
 * Holds a list of simple element in a simple Array
 */
import I18n from "i18n-js";
import Toast from "react-native-tiny-toast";

import asyncReducer, { IAction } from "../../infra/redux/async";
import { actionTypesCreateFolder } from "../actions/create";
import { actionTypesDelete } from "../actions/delete";
import { actionTypesList } from "../actions/list";
import { actionTypesMove } from "../actions/move";
import { actionTypesPast } from "../actions/past";
import { actionTypesRename } from "../actions/rename";
import { actionTypesRestore } from "../actions/restore";
import { actionTypesUpload } from "../actions/upload";
import { IItem, IItems, IState } from "../types";
import { Dispatch } from "redux";

const stateDefault: IState = {
  data: {},
};

const actionTypeResetError = "WORKSPACE_RESET_ERROR";

export const resetError = () => (dispatch: Dispatch) => {
  dispatch({ type: actionTypeResetError });
};

export default (state: IState = stateDefault, action: IAction<IItems<IItem | string>>) => {
  switch (action.type) {
    case actionTypesDelete.requested:
    case actionTypesDelete.received:
      return pushData(state, action, actionTypesDelete);
    case actionTypesUpload.received:
      return pushData(state, action, actionTypesUpload);
    case actionTypesCreateFolder.requested:
    case actionTypesCreateFolder.received:
      return pushData(state, action, actionTypesCreateFolder);
    case actionTypesPast.received:
      Toast.showSuccess(I18n.t("copy-success"));
    case actionTypesPast.requested:
      return pushData(state, action, actionTypesPast);
    case actionTypesMove.received:
      Toast.showSuccess(I18n.t("move-success"));
    case actionTypesMove.requested:
      return pushData(state, action, actionTypesMove);
    case actionTypesRestore.received:
      Toast.showSuccess(I18n.t("restore-successful"));
    case actionTypesRestore.requested:
      return pushData(state, action, actionTypesRestore);
    case actionTypesList.requested:
    case actionTypesList.received:
      return pushData(state, action, actionTypesList);
    case actionTypesRename.requested:
    case actionTypesRename.received:
      return pushData(state, action, actionTypesRename);
    case actionTypesRename.fetchError:
    case actionTypesList.fetchError:
    case actionTypesMove.fetchError:
    case actionTypesRestore.fetchError:
    case actionTypesPast.fetchError:
    case actionTypesCreateFolder.fetchError:
    case actionTypesUpload.fetchError:
    case actionTypesDelete.fetchError:
      return {
        error: { type: action.type, errmsg: action.errmsg },
        ...state,
      };
    case actionTypeResetError:
      const { error, ...rest } = state;
      return rest;
    default:
      return state;
  }
};

function pushData(state: IState, action: IAction<IItems<IItem | string>>, actionTypes) {
  return {
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
    case actionTypesMove.received:
    case actionTypesRestore.received:
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
