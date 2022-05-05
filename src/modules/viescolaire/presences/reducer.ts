/**
 * Sub-module Presences Reducer
 */

import { INotifiationChildren } from './state/eventsNotification';
import { IMultipleSlotsState } from './state/multipleSlots';
import { IRegisterPreferencesState } from './state/registerPreferences';
import { IClassesCallListState } from './state/teacherClassesCall';
import { ICoursesRegisterInfosState } from './state/teacherCourseRegister';
import { ICoursesListState } from './state/teacherCourses';
import { IPresencesUserChildrenState } from './state/userChildren';

// State

export interface IPresences_State {
  coursesList: ICoursesListState;
  callList: IClassesCallListState;
  coursesRegister: ICoursesRegisterInfosState;
  history: any;
  notification: INotifiationChildren[];
  multipleSlots: IMultipleSlotsState;
  registerPreferences: IRegisterPreferencesState;
  userChildren: IPresencesUserChildrenState;
}
