/**
 * EDT Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { IClass, IEdtCourse, ISlot, IUserChild } from '~/framework/modules/viescolaire/edt/model';
import moduleConfig from '~/framework/modules/viescolaire/edt/module-config';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

interface IEdtReduxStateData {
  classes: IClass[];
  courses: IEdtCourse[];
  slots: ISlot[];
  userChildren: IUserChild[];
}

export interface IEdtReduxState {
  classes: AsyncState<IClass[]>;
  courses: AsyncState<IEdtCourse[]>;
  slots: AsyncState<ISlot[]>;
  userChildren: AsyncState<IUserChild[]>;
}

const initialState: IEdtReduxStateData = {
  classes: [],
  courses: [],
  slots: [],
  userChildren: [],
};

export const actionTypes = {
  classes: createAsyncActionTypes(moduleConfig.namespaceActionType('CLASSES')),
  courses: createAsyncActionTypes(moduleConfig.namespaceActionType('COURSES')),
  slots: createAsyncActionTypes(moduleConfig.namespaceActionType('TIME_SLOTS')),
  userChildren: createAsyncActionTypes(moduleConfig.namespaceActionType('USER_CHILDREN')),
};

const reducer = combineReducers({
  classes: createSessionAsyncReducer(initialState.classes, actionTypes.classes),
  courses: createSessionAsyncReducer(initialState.courses, actionTypes.courses),
  slots: createSessionAsyncReducer(initialState.slots, actionTypes.slots),
  userChildren: createSessionAsyncReducer(initialState.userChildren, actionTypes.userChildren),
});

Reducers.register(moduleConfig.reducerName, reducer);

export default reducer;
