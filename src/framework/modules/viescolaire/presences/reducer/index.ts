/**
 * Presences Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { IClassCall, ICourse, IUserChild } from '~/framework/modules/viescolaire/presences/model';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

interface IPresencesReduxStateData {
  allowMultipleSlots: boolean;
  classCall?: IClassCall;
  courses: ICourse[];
  registerPreference: string;
  userChildren: IUserChild[];
}

export interface IPresencesReduxState {
  allowMultipleSlots: AsyncState<boolean>;
  classCall: AsyncState<IClassCall | undefined>;
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
  classCall: createAsyncActionTypes(moduleConfig.namespaceActionType('CLASS_CALL')),
  courses: createAsyncActionTypes(moduleConfig.namespaceActionType('COURSES')),
  createAbsence: createAsyncActionTypes(moduleConfig.namespaceActionType('CREATE_ABSENCE')),
  multipleSlotsSetting: createAsyncActionTypes(moduleConfig.namespaceActionType('MULTIPLE_SLOTS_SETTING')),
  registerPreference: createAsyncActionTypes(moduleConfig.namespaceActionType('REGISTER_PREFERENCE')),
  userChildren: createAsyncActionTypes(moduleConfig.namespaceActionType('USER_CHILDREN')),
};

const reducer = combineReducers({
  allowMultipleSlots: createSessionAsyncReducer(initialState.allowMultipleSlots, actionTypes.multipleSlotsSetting),
  classCall: createSessionAsyncReducer(initialState.classCall, actionTypes.classCall),
  courses: createSessionAsyncReducer(initialState.courses, actionTypes.courses),
  registerPreference: createSessionAsyncReducer(initialState.registerPreference, actionTypes.registerPreference),
  userChildren: createSessionAsyncReducer(initialState.userChildren, actionTypes.userChildren),
});

Reducers.register(moduleConfig.reducerName, reducer);

export default reducer;
