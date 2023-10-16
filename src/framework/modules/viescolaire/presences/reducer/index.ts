/**
 * Presences Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { ISchoolYear, ITerm } from '~/framework/modules/viescolaire/common/model';
import {
  Absence,
  Call,
  ChildEvents,
  Course,
  EventReason,
  PresencesUserChild,
  Statistics,
} from '~/framework/modules/viescolaire/presences/model';
import moduleConfig from '~/framework/modules/viescolaire/presences/module-config';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

interface PresencesReduxStateData {
  absenceStatements: Absence[];
  allowMultipleSlots: boolean;
  call?: Call;
  childrenEvents: { [key: string]: ChildEvents };
  courses: { [key: string]: Course[] };
  eventReasons: EventReason[];
  registerPreference: string;
  schoolYear?: ISchoolYear;
  statistics: Statistics;
  terms: ITerm[];
  userChildren: PresencesUserChild[];
}

export interface PresencesReduxState {
  absenceStatements: AsyncState<Absence[]>;
  allowMultipleSlots: AsyncState<boolean>;
  call: AsyncState<Call | undefined>;
  childrenEvents: AsyncState<{ [key: string]: ChildEvents }>;
  courses: AsyncState<{ [key: string]: Course[] }>;
  eventReasons: AsyncState<EventReason[]>;
  registerPreference: AsyncState<string>;
  schoolYear: AsyncState<ISchoolYear | undefined>;
  statistics: AsyncState<Statistics>;
  terms: AsyncState<ITerm[]>;
  userChildren: AsyncState<PresencesUserChild[]>;
}

const initialState: PresencesReduxStateData = {
  absenceStatements: [],
  allowMultipleSlots: true,
  childrenEvents: {},
  courses: {},
  eventReasons: [],
  registerPreference: '',
  statistics: {
    DEPARTURE: {
      events: [],
      total: 0,
    },
    FORGOTTEN_NOTEBOOK: {
      events: [],
      total: 0,
    },
    INCIDENT: {
      events: [],
      total: 0,
    },
    LATENESS: {
      events: [],
      total: 0,
    },
    NO_REASON: {
      events: [],
      total: 0,
    },
    PUNISHMENT: {
      events: [],
      total: 0,
    },
    REGULARIZED: {
      events: [],
      total: 0,
    },
    UNREGULARIZED: {
      events: [],
      total: 0,
    },
    recoveryMethod: null,
  },
  terms: [],
  userChildren: [],
};

export const actionTypes = {
  absenceStatements: createAsyncActionTypes(moduleConfig.namespaceActionType('ABSENCE_STATEMENTS')),
  call: createAsyncActionTypes(moduleConfig.namespaceActionType('CALL')),
  childrenEvents: createAsyncActionTypes(moduleConfig.namespaceActionType('CHILDREN_EVENTS')),
  courses: createAsyncActionTypes(moduleConfig.namespaceActionType('COURSES')),
  createAbsence: createAsyncActionTypes(moduleConfig.namespaceActionType('CREATE_ABSENCE')),
  eventReasons: createAsyncActionTypes(moduleConfig.namespaceActionType('EVENT_REASONS')),
  multipleSlotsSetting: createAsyncActionTypes(moduleConfig.namespaceActionType('MULTIPLE_SLOTS_SETTING')),
  registerPreference: createAsyncActionTypes(moduleConfig.namespaceActionType('REGISTER_PREFERENCE')),
  schoolYear: createAsyncActionTypes(moduleConfig.namespaceActionType('SCHOOL_YEAR')),
  statistics: createAsyncActionTypes(moduleConfig.namespaceActionType('STATISTICS')),
  terms: createAsyncActionTypes(moduleConfig.namespaceActionType('TERMS')),
  userChildren: createAsyncActionTypes(moduleConfig.namespaceActionType('USER_CHILDREN')),
};

const reducer = combineReducers({
  absenceStatements: createSessionAsyncReducer(initialState.absenceStatements, actionTypes.absenceStatements),
  allowMultipleSlots: createSessionAsyncReducer(initialState.allowMultipleSlots, actionTypes.multipleSlotsSetting),
  call: createSessionAsyncReducer(initialState.call, actionTypes.call),
  childrenEvents: createSessionAsyncReducer(initialState.childrenEvents, actionTypes.childrenEvents),
  courses: createSessionAsyncReducer(initialState.courses, actionTypes.courses),
  eventReasons: createSessionAsyncReducer(initialState.eventReasons, actionTypes.eventReasons),
  registerPreference: createSessionAsyncReducer(initialState.registerPreference, actionTypes.registerPreference),
  schoolYear: createSessionAsyncReducer(initialState.schoolYear, actionTypes.schoolYear),
  statistics: createSessionAsyncReducer(initialState.statistics, actionTypes.statistics),
  terms: createSessionAsyncReducer(initialState.terms, actionTypes.terms),
  userChildren: createSessionAsyncReducer(initialState.userChildren, actionTypes.userChildren),
});
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
