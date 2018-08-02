/**
 * Manage the current selected homework id. It's state is just a string.
 */

import { HOMEWORK_SELECTED } from "../actions/selected";

// TODO : by default, state is `undefined`. That's cool, the app will force the user to select a homework to display. Therefore, we must keep the info in a local storage or something like this.
export default function selected(state: string = null, action) {
  switch (action.type) {
    case HOMEWORK_SELECTED:
      return action.homeworkId;
    default:
      return state;
  }
}
