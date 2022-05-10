import { createSessionReducer } from '~/infra/redux/reducerFactory';
import { initialState, studentEventsActionsTypes } from '~/modules/viescolaire/presences/state/events';

export default createSessionReducer(initialState, {
  [studentEventsActionsTypes.event]: (state = initialState, action) => {
    const newState = { ...state };
    newState.lateness = action.data.lateness;
    newState.departure = action.data.departure;
    newState.regularized = action.data.regularized;
    newState.unregularized = action.data.unregularized;
    newState.no_reason = action.data.no_reason;
    newState.isPristine = false;
    return newState;
  },
  [studentEventsActionsTypes.incident]: (state, action) => {
    const newState = { ...state };
    newState.incidents = action.data.incidents;
    newState.punishments = action.data.punishments;
    newState.isPristine = false;
    return newState;
  },
  [studentEventsActionsTypes.notebook]: (state, action) => {
    const newState = { ...state };
    newState.notebooks = action.data;
    newState.isPristine = false;
    return newState;
  },
  [studentEventsActionsTypes.clear]: () => {
    return initialState;
  },
  [studentEventsActionsTypes.error]: (state, action) => {
    const newState = { ...state };
    newState.error = action.data;
    return newState;
  },
});
