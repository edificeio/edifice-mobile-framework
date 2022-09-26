/**
 * Vie Scolaire Reducer
 */
import { combineReducers } from 'redux';

import viesco from './reducers';
import { IChildrenGroupsState } from './state/childrenGroups';
import { ICourseListState } from './state/courses';
import { IGroupListState } from './state/group';
import { IPeriodsListState, IYearState } from './state/periods';
import { IPersonnelListState } from './state/personnel';
import { ISubjectListState } from './state/subjects';

export interface IDashboard_State {
  viesco: {
    subjectsList: ISubjectListState;
    personnelList: IPersonnelListState;
    children: any;
    structure: any;
    periods: IPeriodsListState;
    year: IYearState;
    group: IGroupListState;
    childrenGroups: IChildrenGroupsState;
    coursesList: ICourseListState;
  };
}

export default combineReducers({ viesco });
