/**
 * Presences Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { ICourse, IUserChild } from '~/framework/modules/viescolaire/presences/model';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

interface IPresencesReduxStateData {
  allowMultipleSlots: boolean;
  courses: ICourse[];
  registerPreference: string;
  userChildren: IUserChild[];
}

export interface IPresencesReduxState {
  allowMultipleSlots: AsyncState<boolean>;
  courses: AsyncState<ICourse[]>;
  registerPreference: AsyncState<string>;
  userChildren: AsyncState<IUserChild[]>;
}

const initialState: IPresencesReduxStateData = {
  allowMultipleSlots: true,
  courses: [],
  registerPreference: '',
  userChildren: [],
};

export const actionTypes = {
  courses: createAsyncActionTypes(moduleConfig.namespaceActionType('COURSES')),
  createAbsence: createAsyncActionTypes(moduleConfig.namespaceActionType('CREATE_ABSENCE')),
  multipleSlotsSetting: createAsyncActionTypes(moduleConfig.namespaceActionType('MULTIPLE_SLOTS_SETTING')),
  registerPreference: createAsyncActionTypes(moduleConfig.namespaceActionType('REGISTER_PREFERENCE')),
  userChildren: createAsyncActionTypes(moduleConfig.namespaceActionType('USER_CHILDREN')),
};

const reducer = combineReducers({
  allowMultipleSlots: createSessionAsyncReducer(initialState.allowMultipleSlots, actionTypes.multipleSlotsSetting),
  courses: createSessionAsyncReducer(initialState.courses, actionTypes.courses),
  registerPreference: createSessionAsyncReducer(initialState.registerPreference, actionTypes.registerPreference),
  userChildren: createSessionAsyncReducer(initialState.userChildren, actionTypes.userChildren),
});

Reducers.register(moduleConfig.reducerName, reducer);

export default reducer;
