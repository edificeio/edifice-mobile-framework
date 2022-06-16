/**
 * Vie Scolaire Reducer
 */
import { combineReducers } from 'redux';

import { ICdt_State } from './cdt/reducer';
import cdt from './cdt/reducers';
import { ICompetences_State } from './competences/reducer';
import competences from './competences/reducers';
import { IEdt_State } from './edt/reducer';
import edt from './edt/reducers';
import { IPresences_State } from './presences/reducer';
import presences from './presences/reducers';
import viesco from './viesco/reducers';
import { IChildrenGroupsState } from './viesco/state/childrenGroups';
import { ICourseListState } from './viesco/state/courses';
import { IGroupListState } from './viesco/state/group';
import { IMementoState } from './viesco/state/memento';
import { IPeriodsListState, IYearState } from './viesco/state/periods';
import { IPersonnelListState } from './viesco/state/personnel';
import { ISubjectListState } from './viesco/state/subjects';

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
  cdt: ICdt_State;
  edt: IEdt_State;
  presences: IPresences_State;
  competences: ICompetences_State;
}

export default combineReducers({ viesco, cdt, edt, presences, competences });
