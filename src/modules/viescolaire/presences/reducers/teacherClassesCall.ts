import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { teacherEventsActionsTypes } from '~/modules/viescolaire/presences/state/events';
import { actionTypes, initialState } from '~/modules/viescolaire/presences/state/teacherClassesCall';

export default createSessionAsyncReducer(initialState, actionTypes, {
  [teacherEventsActionsTypes.post]: (state = [], action) => {
    const newState = state;
    const i = state.students.findIndex(s => s.id === action.data.student_id);
    const oldEvents = state.students[i].events;
    newState.students[i].events = oldEvents;
    newState.students[i].events.push(action.data);
    return newState;
  },
  [teacherEventsActionsTypes.put]: (state, action) => {
    const newState = state;
    const iStudent = state.students.findIndex(s => s.id === action.data.student_id);
    if (iStudent < 0) return newState;
    const iEvent = state.students[iStudent].events.findIndex(e => e.id === action.data.id);
    newState.students[iStudent].events[iEvent] = Object.assign(newState.students[iStudent].events[iEvent], action.data);
    return newState;
  },
  [teacherEventsActionsTypes.delete]: (state, action) => {
    const newState = state;
    const iStudent = state.students.findIndex(s => s.id === action.data.student_id);
    if (iStudent < 0) return newState;
    const iEvent = state.students[iStudent].events.findIndex(e => e.id === action.data.id);
    newState.students[iStudent].events.splice(iEvent, 1);
    return newState;
  },
  [teacherEventsActionsTypes.error]: (state, action) => {
    return state;
  },
});
