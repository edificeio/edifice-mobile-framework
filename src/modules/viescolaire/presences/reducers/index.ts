import { combineReducers } from 'redux';

import history from './history';
import memento from './memento';
import multipleSlots from './multipleSlots';
import registerPreferences from './registerPreferences';
import relativesNotification from './relativesNotificationModal';
import callList from './teacherClassesCall';
import coursesRegister from './teacherCourseRegister';
import coursesList from './teacherCourses';
import userChildren from './userChildren';

const combinedReducer = combineReducers({
  coursesList,
  callList,
  coursesRegister,
  history,
  memento,
  multipleSlots,
  registerPreferences,
  relativesNotification,
  userChildren,
});

export default combinedReducer;
