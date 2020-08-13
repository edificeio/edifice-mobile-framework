import { createSessionReducer } from "../../../infra/redux/reducerFactory";
import { studentEventsActionsTypes, initialState } from "../state/events";

export default createSessionReducer(initialState, {
  [studentEventsActionsTypes.event]: (state = initialState, action) => {
    const new_state = { ...state };
    new_state.lateness = action.data.lateness;
    new_state.departure = action.data.departure;
    new_state.justified = action.data.justified;
    new_state.unjustified = action.data.unjustified;
    new_state.isPristine = false;
    return new_state;
  },
  [studentEventsActionsTypes.incident]: (state, action) => {
    const new_state = { ...state };
    new_state.incidents = action.data.incidents;
    new_state.punishments = action.data.punishments;
    new_state.isPristine = false;
    return new_state;
  },
  [studentEventsActionsTypes.notebook]: (state, action) => {
    const new_state = { ...state };
    new_state.notebooks = action.data;
    new_state.isPristine = false;
    return new_state;
  },
  [studentEventsActionsTypes.clear]: () => {
    return initialState;
  },
});
