/**
 * Show message action(s)
 * Build actions to be dispatched to the show message reducer.
 */
import conversationConfig from "../config";

import { Action } from "redux";
import { IConversationMessage } from "../reducers";

export const actionTypeReceiversDisplay = conversationConfig.createActionType(
  "RECEIVERS_DISPLAY"
);

export interface IActionReceiversDisplay extends Action {
  from: { id: string, name: string }
  to: Array<{ id: string, name: string }>
  cc: Array<{ id: string, name: string }>
}

export const createActionReceiversDisplay: (
  message: IConversationMessage
) => IActionReceiversDisplay = message => {
  // build list of "to" receivers
  const to: { id: string, name: string }[] = [];
  message.to && message.to.map(idTo => {
    //dN[0]=ID of the user dN[1]=name of the user
    const dN = message.displayNames.find(dN => dN[0] == idTo);
    if (dN) {
      to.push({ id: dN[0], name: dN[1] });
    }
  });
  // build list of "cc" receivers
  const cc: { id: string, name: string }[] = [];
  message.cc && message.cc.map(idCC => {
    //dN[0]=ID of the user dN[1]=name of the user
    const dN = message.displayNames.find(dN => dN[0] == idCC);
    if (dN) {
      cc.push({ id: dN[0], name: dN[1] });
    }
  });
  //
  return {
    from: { id: message.from, name: message.fromName },
    to,
    cc,
    type: actionTypeReceiversDisplay
  }
};