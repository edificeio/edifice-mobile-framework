import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import moduleConfig from '~/framework/modules/viescolaire/dashboard/module-config';

import children from './children';
import structure from './structure';

export interface IDashboardReduxState {
  children: any;
  structure: any;
}

const reducer = combineReducers({
  children,
  structure,
});
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
