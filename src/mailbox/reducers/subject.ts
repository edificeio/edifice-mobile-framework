import { AnyAction } from "redux";
import { createEndSessionActionType } from "../../infra/redux/reducerFactory";
import { actionTypeSubjectSelect, actionTypeSubjectClear } from "../actions/selectSubject";

/**
 * Manage the subject of the thread.
 */

const defaultState: string = "";

export default function subject(
  state = defaultState,
  action: AnyAction
) {
  switch (action.type) {
    case actionTypeSubjectSelect:
      return action.subject;
    case actionTypeSubjectClear:
      return defaultState;
    // Session flush forward-compatibility.
    case createEndSessionActionType():
      return defaultState;
    default:
      return state;
  }
}
