/**
 * Vie Scolaire Reducer
 */

import { combineReducers } from 'redux';

import cdt from './cdt/reducers';
import { IHomeworkListState } from './cdt/state/homeworks';
import { ISessionListState } from './cdt/state/sessions';
import { ITimeSlotsState } from './cdt/state/timeSlots';
import competences from './competences/reducers';
import { ILevelsListState } from './competences/state/competencesLevels';
import { IDevoirsMatieresState } from './competences/state/devoirs';
import { IMoyenneListState } from './competences/state/moyennes';
import { ICompetencesUserChildrenState } from './competences/state/userChildren';
import edt from './edt/reducers';
import { ISlotListState } from './edt/state/slots';
import { IEdtUserChildrenState } from './edt/state/userChildren';
import presences from './presences/reducers';
import { INotifiationChildren } from './presences/state/eventsNotification';
import { IMultipleSlotsState } from './presences/state/multipleSlots';
import { IRegisterPreferencesState } from './presences/state/registerPreferences';
import { IClassesCallListState } from './presences/state/teacherClassesCall';
import { ICoursesRegisterInfosState } from './presences/state/teacherCourseRegister';
import { ICoursesListState } from './presences/state/teacherCourses';
import viesco from './viesco/reducers';
import { IChildrenGroupsState } from './viesco/state/childrenGroups';
import { ICourseListState } from './viesco/state/courses';
import { IGroupListState } from './viesco/state/group';
import { IMementoState } from './viesco/state/memento';
import { IPeriodsListState, IYearState } from './viesco/state/periods';
import { IPersonnelListState } from './viesco/state/personnel';
import { ISubjectListState } from './viesco/state/subjects';

// State

export interface IViesco_State {
  viesco: {
    subjectsList: ISubjectListState;
    personnelList: IPersonnelListState;
    children: any;
    structure: any;
    periods: IPeriodsListState;
    year: IYearState;
    group: IGroupListState;
    childrenGroups: IChildrenGroupsState;
    memento: IMementoState;
    coursesList: ICourseListState;
  };
  cdt: {
    homeworksList: IHomeworkListState;
    sessionsList: ISessionListState;
    timeSlots: ITimeSlotsState;
  };
  edt: {
    slotsList: ISlotListState;
    userChildren: IEdtUserChildrenState;
  };
  presences: {
    coursesList: ICoursesListState;
    callList: IClassesCallListState;
    coursesRegister: ICoursesRegisterInfosState;
    history: any;
    notification: INotifiationChildren[];
    multipleSlots: IMultipleSlotsState;
    registerPreferences: IRegisterPreferencesState;
  };
  competences: {
    levels: ILevelsListState;
    devoirsMatieres: IDevoirsMatieresState;
    moyennesList: IMoyenneListState;
    userChildren: ICompetencesUserChildrenState;
  };
}

// Reducer

export default combineReducers({ viesco, cdt, edt, presences, competences });

// Getters
