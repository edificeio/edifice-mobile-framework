/**
 * EDT Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { IUser } from '~/framework/modules/auth/model';
import { IClassGroups } from '~/framework/modules/viescolaire/common/model';
import { IClass, IEdtCourse, ISlot, IUserChild } from '~/framework/modules/viescolaire/edt/model';
import moduleConfig from '~/framework/modules/viescolaire/edt/module-config';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

interface IEdtReduxStateData {
  classes: IClass[];
  classGroups: IClassGroups[];
  courses: IEdtCourse[];
  slots: ISlot[];
  teachers: IUser[];
  userChildren: IUserChild[];
}

export interface IEdtReduxState {
  classes: AsyncState<IClass[]>;
  classGroups: AsyncState<IClassGroups[]>;
  courses: AsyncState<IEdtCourse[]>;
  slots: AsyncState<ISlot[]>;
  teachers: AsyncState<IUser[]>;
  userChildren: AsyncState<IUserChild[]>;
}

const initialState: IEdtReduxStateData = {
  classes: [],
  classGroups: [],
  courses: [],
  slots: [],
  teachers: [],
  userChildren: [],
};

export const actionTypes = {
  classes: createAsyncActionTypes(moduleConfig.namespaceActionType('CLASSES')),
  classGroups: createAsyncActionTypes(moduleConfig.namespaceActionType('CLASS_GROUPS')),
  courses: createAsyncActionTypes(moduleConfig.namespaceActionType('COURSES')),
  slots: createAsyncActionTypes(moduleConfig.namespaceActionType('TIME_SLOTS')),
  teachers: createAsyncActionTypes(moduleConfig.namespaceActionType('TEACHERS')),
  userChildren: createAsyncActionTypes(moduleConfig.namespaceActionType('USER_CHILDREN')),
};

const reducer = combineReducers({
  classes: createSessionAsyncReducer(initialState.classes, actionTypes.classes),
  classGroups: createSessionAsyncReducer(initialState.classGroups, actionTypes.classGroups),
  courses: createSessionAsyncReducer(initialState.courses, actionTypes.courses),
  slots: createSessionAsyncReducer(initialState.slots, actionTypes.slots),
  teachers: createSessionAsyncReducer(initialState.teachers, actionTypes.teachers),
  userChildren: createSessionAsyncReducer(initialState.userChildren, actionTypes.userChildren),
});

Reducers.register(moduleConfig.reducerName, reducer);

export default reducer;
