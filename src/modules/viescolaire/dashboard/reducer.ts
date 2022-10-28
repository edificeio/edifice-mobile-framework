/**
 * Vie Scolaire Reducer
 */
import { IChildrenGroupsState } from './state/childrenGroups';
import { ICourseListState } from './state/courses';
import { IGroupListState } from './state/group';
import { IPeriodsListState, IYearState } from './state/periods';
import { IPersonnelListState } from './state/personnel';
import { ISubjectListState } from './state/subjects';

export interface IDashboard_State {
  subjectsList: ISubjectListState;
  personnelList: IPersonnelListState;
  children: any;
  structure: any;
  periods: IPeriodsListState;
  year: IYearState;
  group: IGroupListState;
  childrenGroups: IChildrenGroupsState;
  coursesList: ICourseListState;
}
