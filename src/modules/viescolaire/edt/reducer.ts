/**
 * EDT Reducer
 */
import { combineReducers } from 'redux';

import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';
import moduleConfig from '~/modules/viescolaire/edt/moduleConfig';

// Types

export interface ICourseTag {
  id: number;
  structureId: string;
  label: string;
  abbreviation: string;
  allowRegister: boolean;
  isHidden: boolean;
  isPrimary: boolean;
  isUsed: boolean;
}

export interface IEdtCourse {
  id: string;
  startDate: moment.Moment;
  endDate: moment.Moment;
  subjectId: string;
  roomLabels: string[];
  teacherIds: string[];
  classes: string[];
  groups: string[];
  exceptionnal: string;
  subject: {
    code: string;
    externalId: string;
    id: string;
    name: string;
    rank: number;
  };
  color: string;
  tags: ICourseTag[];
  tagIds: number[];
}

export interface ISlot {
  startHour: moment.Moment;
  endHour: moment.Moment;
  name: string;
}

export interface IUserChild {
  classes: string[];
  displayName: string;
  firstName: string;
  lastName: string;
  id: string;
  idClasses: string;
}

// State

interface IEdt_StateData {
  courses: IEdtCourse[];
  slots: ISlot[];
  userChildren: IUserChild[];
}

export interface IEdt_State {
  courses: AsyncState<IEdtCourse[]>;
  slots: AsyncState<ISlot[]>;
  userChildren: AsyncState<IUserChild[]>;
}

// Reducer

const initialState: IEdt_StateData = {
  courses: [],
  slots: [],
  userChildren: [],
};

export const actionTypes = {
  courses: createAsyncActionTypes(moduleConfig.namespaceActionType('COURSES')),
  slots: createAsyncActionTypes(moduleConfig.namespaceActionType('TIME_SLOTS')),
  userChildren: createAsyncActionTypes(moduleConfig.namespaceActionType('USER_CHILDREN')),
};

export default combineReducers({
  courses: createSessionAsyncReducer(initialState.courses, actionTypes.courses),
  slots: createSessionAsyncReducer(initialState.slots, actionTypes.slots),
  userChildren: createSessionAsyncReducer(initialState.userChildren, actionTypes.userChildren),
});
