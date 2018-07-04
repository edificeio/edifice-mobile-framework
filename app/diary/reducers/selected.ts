/**
 * Manage the current selected diary id. It's state is just a string.
 */

import { DIARY_SELECTED } from "../actions/selected";

// TODO : by default, state is `undefined`. That's cool, the app will force the user to select a diary to display. Therefore, we must keep the info in a local storage or something like this.
export default function selected(state: string = null, action) {
  switch (action.type) {
    case DIARY_SELECTED:
      return action.diaryId;
    default:
      return state;
  }
}
