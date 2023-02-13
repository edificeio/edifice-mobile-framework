import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import moduleConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import { ICourseListState } from '~/framework/modules/viescolaire/dashboard/state/courses';
import { IGroupListState } from '~/framework/modules/viescolaire/dashboard/state/group';
import { IPeriodsListState, IYearState } from '~/framework/modules/viescolaire/dashboard/state/periods';
import { IPersonnelListState } from '~/framework/modules/viescolaire/dashboard/state/personnel';

import children from './children';
import coursesList from './courses';
import group from './group';
import { periods, year } from './periods';
import personnelList from './personnel';
import structure from './structure';

export interface IDashboardReduxState {
  personnelList: IPersonnelListState;
  children: any;
  structure: any;
  periods: IPeriodsListState;
  year: IYearState;
  group: IGroupListState;
  coursesList: ICourseListState;
}

const reducer = combineReducers({
  personnelList,
  children,
  structure,
  periods,
  year,
  group,
  coursesList,
});

Reducers.register(moduleConfig.reducerName, reducer);

export default reducer;
