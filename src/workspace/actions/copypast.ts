import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { asyncActionFactory } from "../../infra/actions/asyncActionFactory";
import { IId } from "../../types";
import {formatResults} from "./helpers/documents";

const WORKSPACE_PAST = "/workspace/documents/copy";

export const actionTypesPast = asyncActionTypes(config.createActionType(`${WORKSPACE_PAST}`));

export const COPY_ACTION_TYPE = "COPY_ACTION";
export const COPY_CLEAR_ACTION_TYPE = "COPY_ACTION";

export function copyAction(selected: Array<any>) {
  return { type: COPY_ACTION_TYPE, payload: selected };
}

export function copyClearAction() {
  return { type: COPY_CLEAR_ACTION_TYPE, payload: [] };
}

export function pastAction(parentId: string, selected: Array<IId>) {
  const toPast: Array<String> = selected.reduce((acc: String[], item) => [...acc, item.id], []);

  return asyncActionFactory(
    `${WORKSPACE_PAST}/${parentId}`,
    { ids: toPast, parentId },
    actionTypesPast,
    formatResults,
    { method: "post" }
  );
}
