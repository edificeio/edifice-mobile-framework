/**
 * Workspace selection state reducer
 * Holds a list of selected item in a simple Array
 */
import { ITreeItem } from "../actions/helpers/formatListFolders";
import { actionTypesFolder } from "../actions/listFolders";
import {IAction} from "../../infra/redux/async";
import I18n from "i18n-js";

const initialState: ITreeItem[] = [{
    id: "owner",
    name: I18n.t("owner"),
    parentId: "0",
    sortNo: "owner",
    children: [],
}];

export default (state = initialState, action: IAction<ITreeItem[]>) => {
  switch (action.type) {
    case actionTypesFolder.received:
      return [{
        ...state[0],
        children: action.data
      }];
    default:
      return state;
  }
};
