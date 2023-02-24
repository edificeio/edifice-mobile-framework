/**
 * Presences Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { ISchoolYear, ITerm } from '~/framework/modules/viescolaire/common/model';
import { IClassCall, ICourse, IHistory, IUserChild } from '~/framework/modules/viescolaire/presences/model';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

interface IPresencesReduxStateData {
  allowMultipleSlots: boolean;
  classCall?: IClassCall;
  courses: ICourse[];
  history: IHistory;
  registerPreference: string;
  schoolYear?: ISchoolYear;
  terms: ITerm[];
  userChildren: IUserChild[];
}

export interface IPresencesReduxState {
  allowMultipleSlots: AsyncState<boolean>;
  classCall: AsyncState<IClassCall | undefined>;
  courses: AsyncState<ICourse[]>;
  history: AsyncState<IHistory>;
  registerPreference: AsyncState<string>;
  schoolYear: AsyncState<ISchoolYear | undefined>;
  terms: AsyncState<ITerm[]>;
  userChildren: AsyncState<IUserChild[]>;
}

const initialState: IPresencesReduxStateData = {
  allowMultipleSlots: true,
  courses: [],
  history: {
    latenesses: [],
    departures: [],
    regularized: [],
    unregularized: [],
    noReason: [],
    forgottenNotebooks: [],
    incidents: [],
    punishments: [],
  },
  registerPreference: '',
  terms: [],
  userChildren: [],
};

export const actionTypes = {
  classCall: createAsyncActionTypes(moduleConfig.namespaceActionType('CLASS_CALL')),
  courses: createAsyncActionTypes(moduleConfig.namespaceActionType('COURSES')),
  createAbsence: createAsyncActionTypes(moduleConfig.namespaceActionType('CREATE_ABSENCE')),
  history: createAsyncActionTypes(moduleConfig.namespaceActionType('HISTORY')),
  multipleSlotsSetting: createAsyncActionTypes(moduleConfig.namespaceActionType('MULTIPLE_SLOTS_SETTING')),
  registerPreference: createAsyncActionTypes(moduleConfig.namespaceActionType('REGISTER_PREFERENCE')),
  schoolYear: createAsyncActionTypes(moduleConfig.namespaceActionType('SCHOOL_YEAR')),
  terms: createAsyncActionTypes(moduleConfig.namespaceActionType('TERMS')),
  userChildren: createAsyncActionTypes(moduleConfig.namespaceActionType('USER_CHILDREN')),
};

const reducer = combineReducers({
  allowMultipleSlots: createSessionAsyncReducer(initialState.allowMultipleSlots, actionTypes.multipleSlotsSetting),
  classCall: createSessionAsyncReducer(initialState.classCall, actionTypes.classCall),
  courses: createSessionAsyncReducer(initialState.courses, actionTypes.courses),
  history: createSessionAsyncReducer(initialState.history, actionTypes.history),
  registerPreference: createSessionAsyncReducer(initialState.registerPreference, actionTypes.registerPreference),
  schoolYear: createSessionAsyncReducer(initialState.schoolYear, actionTypes.schoolYear),
  terms: createSessionAsyncReducer(initialState.terms, actionTypes.terms),
  userChildren: createSessionAsyncReducer(initialState.userChildren, actionTypes.userChildren),
});

Reducers.register(moduleConfig.reducerName, reducer);

export default reducer;
