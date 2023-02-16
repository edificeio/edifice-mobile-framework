import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import moduleConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import { ICourseListState } from '~/framework/modules/viescolaire/dashboard/state/courses';
import { IPeriodsListState, IYearState } from '~/framework/modules/viescolaire/dashboard/state/periods';
import { IPersonnelListState } from '~/framework/modules/viescolaire/dashboard/state/personnel';

import children from './children';
import coursesList from './courses';
import { periods, year } from './periods';
import personnelList from './personnel';
import structure from './structure';

export interface IDashboardReduxState {
  personnelList: IPersonnelListState;
  children: any;
  structure: any;
  periods: IPeriodsListState;
  year: IYearState;
  coursesList: ICourseListState;
}

const reducer = combineReducers({
  personnelList,
  children,
  structure,
  periods,
  year,
  coursesList,
});

Reducers.register(moduleConfig.reducerName, reducer);

export default reducer;
