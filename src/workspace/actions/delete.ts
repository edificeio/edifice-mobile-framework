import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { asyncActionFactory } from "../../infra/actions/asyncActionFactory";
import { IId } from "../../types";

const WORKSPACE_DELETE = "/workspace/documents/trash";

export const actionTypesDelete = asyncActionTypes(config.createActionType(`${WORKSPACE_DELETE}`));

export function deleteAction(dispatch, parentId: string, selected: Array<IId>) {
  const toDelete: Array<String> = selected.reduce((acc: String[], item) => [...acc, item.id], []);

  return asyncActionFactory(`${WORKSPACE_DELETE}`, { ids: toDelete, parentId }, actionTypesDelete, null, {
    method: "put",
    refresh: true,
  })
}
