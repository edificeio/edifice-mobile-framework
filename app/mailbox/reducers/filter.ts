/**
 * Manage the current filter for threads.
 */

import {
  actionTypeClearFilter,
  actionTypeFilterThreads
} from "../actions/filter";

const defaultState = {
  cleared: true,
  criteria: ""
};

// TODO : by default, state is `undefined`. That's cool, the app will force the user to select a homework diary to display. Therefore, we must keep the info in a local storage or something like this.
export default function threadFilter(state = defaultState, action) {
  switch (action.type) {
    case actionTypeFilterThreads:
      console.log("reducer", actionTypeFilterThreads, action);
      return {
        cleared: false,
        criteria: action.filter
      };
    case actionTypeClearFilter:
      console.log("reducer", actionTypeClearFilter, action);
      return {
        cleared: true,
        criteria: ""
      };
    default:
      return state;
  }
}
