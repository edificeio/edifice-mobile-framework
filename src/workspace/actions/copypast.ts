import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { asyncActionFactory } from "../../infra/actions/asyncActionFactory";
import { formatResults } from "./helpers/documents";
import { IItem, IItems } from "../types";
import { IId } from "../../types";

const WORKSPACE_PAST = "/workspace/documents/copy";

export const actionTypesPast = asyncActionTypes(config.createActionType(`${WORKSPACE_PAST}`));

export const COPY_ACTION_TYPE = "COPY_ACTION";
export const CUT_ACTION_TYPE = "CUT_ACTION";
export const COPY_CLEAR_ACTION_TYPE = "COPY_CLEAR_ACTION";

export function copyAction(selected: IItems<IItem>) {
  return { type: COPY_ACTION_TYPE, payload: { selected } };
}

export function cutAction(selected: IItems<IItem>) {
  return { type: CUT_ACTION_TYPE, payload: { selected } };
}

export function copyClearAction() {
  return { type: COPY_CLEAR_ACTION_TYPE };
}

export function pastAction(parentId: string, selected: IItems<IItem>) {
  const toPast: Array<String> = Object.values(selected).reduce((acc: String[], item: IId) => [...acc, item.id], []);

  return asyncActionFactory(
    `${WORKSPACE_PAST}/${parentId}`,
    { ids: toPast, parentId },
    actionTypesPast,
    (data: any) => formatResults(data, parentId),
    {
      method: "post",
    }
  );
}
