// ACTION LIST ------------------------------------------------------------------------------------

import { asyncActionTypes } from "../../infra/redux/async";
import config from "../config";
import { IItem, IItems } from "../types/states";

export const actionTypesAdd = asyncActionTypes(config.createActionType('WORKSPACE_ADD'));

export function addInvalidated() {
  return { type: actionTypesAdd.invalidated };
}

export function addRequested() {
  return { type: actionTypesAdd.requested };
}

export function addReceived(data: IItems<IItem>, id: string | undefined) {
  return { type: actionTypesAdd.received, data, id, receivedAt: Date.now() };
}

export function addError(errmsg: string) {
  return { type: actionTypesAdd.fetchError, error: true, errmsg };
}
