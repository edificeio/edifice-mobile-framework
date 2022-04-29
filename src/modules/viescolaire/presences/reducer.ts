/**
 * Sub-module Presences Reducer
 */
import { IMultipleSlotsState } from './state/multipleSlots';
import { IRegisterPreferencesState } from './state/registerPreferences';
import { IChildEventsNotificationState } from './state/relativesNotificationModal';
import { IClassesCallListState } from './state/teacherClassesCall';
import { ICoursesRegisterInfosState } from './state/teacherCourseRegister';
import { ICoursesListState } from './state/teacherCourses';
import { IPresencesUserChildrenState } from './state/userChildren';

// State

export interface IPresences_State {
  coursesList: ICoursesListState;
  callList: IClassesCallListState;
  coursesRegister: ICoursesRegisterInfosState;
  relativesNotification: IChildEventsNotificationState;
  history: any;
  multipleSlots: IMultipleSlotsState;
  registerPreferences: IRegisterPreferencesState;
  userChildren: IPresencesUserChildrenState;
}
