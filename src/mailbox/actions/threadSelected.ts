/**
 * Thread selected action(s)
 * Build actions to be dispatched to the thread selected reducer.
 */
import conversationConfig from "../config";

import { Action } from "redux";

export const actionTypeThreadSelected = conversationConfig.createActionType(
  "THREAD_SELECTED"
);

export interface IActionThreadSelected extends Action {
  threadId: string;
}

export const createActionThreadSelected: (
  threadId: string
) => IActionThreadSelected = threadId => ({
  threadId,
  type: actionTypeThreadSelected
});

export function conversationThreadSelected(threadId: string) {
  return dispatch => {
    dispatch(createActionThreadSelected(threadId));
  };
}

export default conversationThreadSelected;
