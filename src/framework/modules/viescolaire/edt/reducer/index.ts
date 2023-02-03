/**
 * EDT Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { IEdtCourse, ISlot, IUserChild } from '~/framework/modules/viescolaire/edt/model';
import moduleConfig from '~/framework/modules/viescolaire/edt/module-config';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

interface IEdtReduxStateData {
  courses: IEdtCourse[];
  slots: ISlot[];
  userChildren: IUserChild[];
}

export interface IEdtReduxState {
  courses: AsyncState<IEdtCourse[]>;
  slots: AsyncState<ISlot[]>;
  userChildren: AsyncState<IUserChild[]>;
}

const initialState: IEdtReduxStateData = {
  courses: [],
  slots: [],
  userChildren: [],
};

export const actionTypes = {
  courses: createAsyncActionTypes(moduleConfig.namespaceActionType('COURSES')),
  slots: createAsyncActionTypes(moduleConfig.namespaceActionType('TIME_SLOTS')),
  userChildren: createAsyncActionTypes(moduleConfig.namespaceActionType('USER_CHILDREN')),
};

const reducer = combineReducers({
  courses: createSessionAsyncReducer(initialState.courses, actionTypes.courses),
  slots: createSessionAsyncReducer(initialState.slots, actionTypes.slots),
  userChildren: createSessionAsyncReducer(initialState.userChildren, actionTypes.userChildren),
});

Reducers.register(moduleConfig.reducerName, reducer);

export default reducer;
