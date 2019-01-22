/**
 * Set the current message id wich we want to display receivers. It's state is just a string.
 */

import { actionTypeReceiversDisplay, IActionReceiversDisplay } from "../actions/displayReceivers";


export default function receiversDisplay(state: string = null, action) {
  switch (action.type) {
    case actionTypeReceiversDisplay:
      return (action as IActionReceiversDisplay).messageId;
    default:
      return state;
  }
}
