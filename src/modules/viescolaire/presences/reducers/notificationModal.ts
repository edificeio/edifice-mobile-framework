/*import { createSessionAsyncReducer } from "../../../infra/redux/async2";
import { initialStateNotification, actionTypes } from "../state/eventsNotification";

export default createSessionAsyncReducer(initialStateNotification, actionTypes);*/

import { createSessionReducer } from "../../../../infra/redux/reducerFactory";
import { childrenEventsActionsTypes, initialStateNotification } from "../state/eventsNotification";

export default createSessionReducer(initialStateNotification, {
  [childrenEventsActionsTypes.event]: (state = initialStateNotification, action) => {
    const new_state = { ...state };
    /*const new_child = {
      lateness: action.data.lateness,
      departure: action.data.departure,
      regularized: action.data.regularized,
      unregularized: action.data.unregularized,
      isPristine: false,
    };*/
    new_state[0].lateness = action.data.lateness;
    new_state[0].departure = action.data.departure;
    new_state[0].regularized = action.data.regularized;
    new_state[0].unregularized = action.data.unregularized;
    new_state[0].isPristine = false;
    return new_state;
  },
  [childrenEventsActionsTypes.incident]: (state, action) => {
    const new_state = { ...state };
    new_state[0].incidents = action.data.incidents;
    new_state[0].punishments = action.data.punishments;
    new_state[0].isPristine = false;
    return new_state;
  },
  [childrenEventsActionsTypes.notebook]: (state, action) => {
    const new_state = { ...state };
    new_state[0].notebooks = action.data;
    new_state[0].isPristine = false;
    return new_state;
  },
  [childrenEventsActionsTypes.clear]: () => {
    return initialStateNotification;
  },
  [childrenEventsActionsTypes.error]: (state, action) => {
    const new_state = { ...state };
    new_state[0].error = action.data;
    return new_state;
  },
});
