/**
 * Manage the current selected thread id. It's state is just a string.
 */

import { actionTypeThreadSelected } from "../actions/threadSelected";
import { createEndSessionActionType } from "../../infra/redux/reducerFactory";

// TODO : by default, state is `undefined`. That's cool, the app will force the user to select a homework diary to display. Therefore, we must keep the info in a local storage or something like this.
export default function selectedThread(state: string = null, action) {
  // action contains `threadId: string`
  switch (action.type) {
    case actionTypeThreadSelected:
      return action.threadId;
    // Session flush forward-compatibility.
    case createEndSessionActionType():
      return null;
    default:
      return state;
  }
}
