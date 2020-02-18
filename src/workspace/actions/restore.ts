import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { asyncActionFactory } from "../../infra/actions/asyncActionFactory";
import { IId } from "../../types";
import { IItems } from "../../types/iid";
import { IItem } from "../types";
import { formatResults } from "./helpers/documents";

const WORKSPACE_RESTORE = "/workspace/documents/restore";

export const actionTypesRestore = asyncActionTypes(config.createActionType(`${WORKSPACE_RESTORE}`));

export function restoreAction(parentId: string, selected: IItems<IItem>) {
  const ids: string[] = Object.values(selected).reduce((acc: string[], item: IId) => [...acc, item.id], []);

  return asyncActionFactory(`${WORKSPACE_RESTORE}`, { ids, parentId }, actionTypesRestore, formatResults, {
    method: "put",
  });
}
