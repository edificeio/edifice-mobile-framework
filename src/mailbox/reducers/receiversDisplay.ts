/**
 * Set the current message id wich we want to display receivers. It's state is just a string.
 */

import { actionTypeReceiversDisplay, IActionReceiversDisplay } from "../actions/displayReceivers";

export interface IConversationReceiverList {
  from: { id: string, name: string }
  to: Array<{ id: string, name: string }>
  cc: Array<{ id: string, name: string }>
}
const defaultState: IConversationReceiverList = {
  from: { id: "", name: "" },
  cc: [],
  to: []
}
export default function receiversDisplay(state: IConversationReceiverList = defaultState, action): IConversationReceiverList {
  switch (action.type) {
    case actionTypeReceiversDisplay:
      return { ...(action as IActionReceiversDisplay) };
    default:
      return state;
  }
}
