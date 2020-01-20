import { IAction } from "../../infra/redux/async";

export const SELECT_ACTION_TYPE = "SELECT_ACTION";
export const SELECT_CLEAR_ACTION_TYPE = "SELECT_CLEAR_ACTION";

export function selectAction(item: any): IAction<any> {
  return {
    type: SELECT_ACTION_TYPE,
    payload: {
      ...item,
    },
  };
}

export function selectClearAction(): IAction<any> {
  return {
    type: SELECT_CLEAR_ACTION_TYPE,
  };
}
