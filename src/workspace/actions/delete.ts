import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { asyncActionFactory } from "../../infra/actions/asyncActionFactory";
import { ISelectState } from "../reducers/select";
import { IItem } from "../types/states";

const WORKSPACE_DELETE = "/workspace/documents/trash";

export const actionTypesDelete = asyncActionTypes(config.createActionType(`${WORKSPACE_DELETE}`));

export function deleteAction(parentId: string, selected: ISelectState<IItem>) {
  const toDelete: Array<String> = Object.values(selected).reduce((acc: String[], item) => [...acc, item.id], []);

  return asyncActionFactory(`${WORKSPACE_DELETE}`, { ids: toDelete, parentId }, actionTypesDelete, null, {
    method: "put",
  });
}
