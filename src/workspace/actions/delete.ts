import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { asyncActionFactory } from "../../infra/actions/asyncActionFactory";
import { IItems } from "../reducers/select";
import { IItem } from "../types/states";
import { formatResults } from "./helpers/documents";

const WORKSPACE_DELETE = "/workspace/documents/trash";

export const actionTypesDelete = asyncActionTypes(config.createActionType(`${WORKSPACE_DELETE}`));

export function deleteAction(parentId: string, selected: IItems<IItem>) {
  const toDelete: string[] = Object.values(selected).reduce((acc: string[], item) => [...acc, item.id], []);

  return asyncActionFactory(`${WORKSPACE_DELETE}`, { ids: toDelete, parentId }, actionTypesDelete, formatResults, {
    method: "put",
  });
}
