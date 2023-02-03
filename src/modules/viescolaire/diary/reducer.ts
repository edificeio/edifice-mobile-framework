/**
 * Diary Reducer
 */
import { combineReducers } from 'redux';

import { ISlot } from '~/framework/modules/viescolaire/edt/model';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';
import moduleConfig from '~/modules/viescolaire/diary/moduleConfig';

// Types

interface ISubject {
  id: string;
  externalId: string;
  name: string;
  rank?: number;
}

interface IAudience {
  externalId: string;
  id: string;
  labels: string[];
  name: string;
}

export interface IHomework {
  due_date: moment.Moment;
  id: string;
  is_published: boolean;
  progress?: {
    created: string;
    homework_id: number;
    modified: string;
    state_id: number;
    state_label: string;
    user_id: string;
  };
  exceptional_label: string;
  subject_id: string;
  subject: ISubject;
  type: {
    id: number;
    label: string;
    rank: number;
    structure_id: string;
  };
  description: string;
  created_date: moment.Moment;
  audience: IAudience;
  session_id: string;
}

export type IHomeworkMap = {
  [key: string]: IHomework;
};

export type ISessionHomework = {
  archive_school_year: string;
  audience: IAudience;
  audience_id: string;
  color: string;
  created: string;
  description: string;
  due_date: string;
  estimatedtime: number;
  exceptional_label: string;
  from_session_id: string;
  id: string;
  is_published: boolean;
  modified: string;
  owner_id: string;
  publish_date: string;
  session_id: string;
  structure_id: string;
  subject: ISubject;
  subject_id: string;
  teacher_id: string;
  type: {
    id: number;
    label: string;
    rank: number;
    structure_id: string;
  };
  type_id: number;
  workload: number;
};

export interface ISession {
  id: string;
  is_published: boolean;
  is_empty: boolean;
  date: moment.Moment;
  subject_id: string;
  subject: ISubject;
  exceptional_label: string;
  start_time: string;
  end_time: string;
  teacher_id: string;
  description: string;
  title: string;
  homeworks: ISessionHomework[];
  course_id: string;
  audience: IAudience;
}

// State

interface IDiary_StateData {
  homeworks: IHomeworkMap;
  sessions: ISession[];
  slots: ISlot[];
}

export interface IDiary_State {
  homeworks: AsyncState<IHomeworkMap>;
  sessions: AsyncState<ISession[]>;
  slots: AsyncState<ISlot[]>;
}

// Reducer

const initialState: IDiary_StateData = {
  homeworks: {},
  sessions: [],
  slots: [],
};

export const actionTypes = {
  homeworks: createAsyncActionTypes(moduleConfig.namespaceActionType('HOMEWORKS')),
  sessions: createAsyncActionTypes(moduleConfig.namespaceActionType('SESSIONS')),
  slots: createAsyncActionTypes(moduleConfig.namespaceActionType('TIME_SLOTS')),
  updateHomework: createAsyncActionTypes(moduleConfig.namespaceActionType('UPDATE_HOMEWORK')),
};

const homeworksActionHandler = {
  [actionTypes.updateHomework.receipt]: (state, action) => {
    const stateUpdated = Object.assign({}, state);
    if (stateUpdated[action.data.homeworkId].progress === null) stateUpdated[action.data.homeworkId].progress = {};
    stateUpdated[action.data.homeworkId].progress.state_label = action.data.status;
    stateUpdated[action.data.homeworkId].progress.state_id = action.data.status === 'todo' ? 1 : 2;
    action.data = stateUpdated;
    return { ...stateUpdated };
  },
};

export default combineReducers({
  homeworks: createSessionAsyncReducer(initialState.homeworks, actionTypes.homeworks, homeworksActionHandler),
  sessions: createSessionAsyncReducer(initialState.sessions, actionTypes.sessions),
  slots: createSessionAsyncReducer(initialState.slots, actionTypes.slots),
});

/*
export const initialState: ISessionList = [
  {
    id: '',
    is_published: false,
    is_empty: false,
    date: moment(),
    subject_id: '',
    subject: {
      id: '',
      externalId: '',
      name: '',
      rank: 0,
    },
    exceptional_label: '',
    start_time: '',
    end_time: '',
    teacher_id: '',
    description: '',
    title: '',
    homeworks: [],
    course_id: '',
    audience: {
      externalId: '',
      id: '',
      labels: [],
      name: '',
    },
  },
];
*/
