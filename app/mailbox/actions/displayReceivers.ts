/**
 * Show message action(s)
 * Build actions to be dispatched to the show message reducer.
 */
import conversationConfig from "../config";

import { Action } from "redux";

export const actionTypeReceiversDisplay = conversationConfig.createActionType(
  "RECEIVERS_DISPLAY"
);

export interface IActionReceiversDisplay extends Action {
  messageId: string;
}

export const createActionReceiversDisplay: (
  messageId: string
) => IActionReceiversDisplay = messageId => ({
  messageId,
  type: actionTypeReceiversDisplay
});