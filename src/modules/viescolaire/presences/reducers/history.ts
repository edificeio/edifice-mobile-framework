import { createSessionReducer } from '~/infra/redux/reducerFactory';
import { initialState, studentEventsActionsTypes } from '~/modules/viescolaire/presences/state/events';

export default createSessionReducer(initialState, {
  [studentEventsActionsTypes.event]: (state = initialState, action) => {
    const new_state = { ...state };
    new_state.lateness = action.data.lateness;
    new_state.departure = action.data.departure;
    new_state.regularized = action.data.regularized;
    new_state.unregularized = action.data.unregularized;
    new_state.no_reason = action.data.no_reason;
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
  [studentEventsActionsTypes.error]: (state, action) => {
    const new_state = { ...state };
    new_state.error = action.data;
    return new_state;
  },
});
