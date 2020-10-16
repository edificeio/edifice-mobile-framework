import { createSessionAsyncReducer } from "../../../infra/redux/async2";
import { eventsActionsTypes } from "../state/events";
import { initialState, actionTypes } from "../state/teacherClassesCall";

export default createSessionAsyncReducer(initialState, actionTypes, {
  [eventsActionsTypes.post]: (state = [], action) => {
    const new_state = state;
    const i = state.students.findIndex(s => s.id === action.data.student_id);
    const old_events = state.students[i].events;
    new_state.students[i].events = [...old_events];
    new_state.students[i].events.push(action.data);
    return new_state;
  },
  [eventsActionsTypes.put]: (state, action) => {
    const new_state = state;
    const iStudent = state.students.findIndex(s => s.id === action.data.student_id);
    if (iStudent < 0) return new_state;
    const iEvent = state.students[iStudent].events.findIndex(e => e.id === action.data.id);
    new_state.students[iStudent].events[iEvent] = Object.assign(
      new_state.students[iStudent].events[iEvent],
      action.data
    );
    return new_state;
  },
  [eventsActionsTypes.delete]: (state, action) => {
    const new_state = { ...state };
    const iStudent = state.students.findIndex(s => s.id === action.data.student_id);
    if (iStudent < 0) return new_state;
    const iEvent = state.students[iStudent].events.findIndex(e => e.id === action.data.id);
    new_state.students[iStudent].events.splice(iEvent, 1);
    return new_state;
  },
  [eventsActionsTypes.error]: (state, action) => {
    console.error("EVENT ACTION ERROR : ", action.error);
    return state;
  },
});
