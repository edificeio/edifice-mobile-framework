import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { asyncActionFactory } from "../../infra/actions/asyncActionFactory";
import { IId } from "../../types";
import { IItems } from "../../types/iid";
import { IItem } from "../types";
import { formatResults } from "./helpers/documents";
import { Trackers } from "../../framework/util/tracker";

const WORKSPACE_RESTORE = "/workspace/documents/restore";

export const actionTypesRestore = asyncActionTypes(config.createActionType(`${WORKSPACE_RESTORE}`));

export function restoreAction(parentId: string, selected: IItems<IItem>) {
  const ids: string[] = Object.values(selected).reduce((acc: string[], item: IId) => [...acc, item.id], []);

  Trackers.trackEvent("Workspace", "RESTORE", undefined, Object.keys(selected).length)

  return asyncActionFactory(`${WORKSPACE_RESTORE}`, { ids, parentId }, actionTypesRestore, formatResults, {
    method: "put",
  });
}
