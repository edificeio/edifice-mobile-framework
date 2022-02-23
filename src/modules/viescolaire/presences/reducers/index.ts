import { combineReducers } from 'redux';

import history from './history';
import multipleSlots from './multipleSlots';
import registerPreferences from './registerPreferences';
import callList from './teacherClassesCall';
import coursesRegister from './teacherCourseRegister';
import coursesList from './teacherCourses';
import userChildren from './userChildren';

const combinedReducer = combineReducers({
  coursesList,
  callList,
  coursesRegister,
  history,
  multipleSlots,
  registerPreferences,
  userChildren,
});

export default combinedReducer;
