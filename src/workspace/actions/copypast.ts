import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { asyncActionFactory } from "../../infra/actions/asyncActionFactory";
import { IId } from "../../types";
import { ISelectState } from "../reducers/select";
import { IItem } from "../types";

const WORKSPACE_PAST = "/workspace/documents/copy";

export const actionTypesPast = asyncActionTypes(config.createActionType(`${WORKSPACE_PAST}`));

export const COPY_ACTION_TYPE = "COPY_ACTION";
export const CUT_ACTION_TYPE = "CUT_ACTION";
export const COPY_CLEAR_ACTION_TYPE = "COPY_CLEAR_ACTION";

export function copyAction(selected: ISelectState<IItem>) {
  return { type: COPY_ACTION_TYPE, payload: { selected } };
}

export function cutAction(selected: ISelectState<IItem>) {
  return { type: CUT_ACTION_TYPE, payload: { selected } };
}

export function copyClearAction() {
  return { type: COPY_CLEAR_ACTION_TYPE };
}

export function pastAction(parentId: string, selected: ISelectState<IItem>) {
  const toPast: Array<String> = Object.values(selected).reduce((acc: String[], item: IId) => [...acc, item.id], []);

  return asyncActionFactory(`${WORKSPACE_PAST}/${parentId}`, { ids: toPast, parentId }, actionTypesPast, null, {
    method: "post",
  });
}
