/**
 * Diary tasks (by diaryId) state reducer
 * Holds a list of task by day, by diaryId in a double-array.
 */

import moment from "moment";

import asyncReducer, { actionTypeReceived, IAsyncReducer } from "./async";

import {
  actionPrefix,
  DIARY_TASKS_FETCH_ERROR,
  DIARY_TASKS_INVALIDATED,
  DIARY_TASKS_RECEIVED,
  DIARY_TASKS_REQUESTED
} from "../actions/tasks";

// TYPE DEFINITIONS -------------------------------------------------------------------------------

import { IArrayById, IDiaryList } from "./list";

// TODO : move this. This is useful elsewhere.
export interface IOrderedArrayById<T extends { id: any }> {
  byId: { [id: string]: T };
  ids: string[];
}

// A single task.
export interface IDiaryTask {
  id: string;
  title: string;
  content: string;
}

// All tasks of a day.
export type IDiaryTaskArray = IOrderedArrayById<IDiaryTask>;

// A single day with its task array.
export interface IDiaryDay {
  id: string; // string version of `date` ("AAAA-MM-JJ")
  date: moment.Moment;
  tasks: IDiaryTaskArray;
}

// All days of a diary.
export type IDiaryTasks = IOrderedArrayById<IDiaryDay>;

// All diaries
export interface IAllDiaryTasksByDiaryIds {
  [id: string]: IAsyncReducer<IDiaryTasks>;
}

// THE REDUCER ------------------------------------------------------------------------------------

/**
 * Diary SingleTasks Reducer : A reducer that manage state for the task list of a single diary.
 * Does not store the diaryId. Made to be incorporated in the diaryAllTasksReducer as a dynamic reducer function.
 * This IS an async reducer.
 */

const stateSingleTasksDefault: IDiaryTasks = { byId: {}, ids: [] };

const diarySingleTasksReducer = asyncReducer<IDiaryTasks>(
  (state: IDiaryTasks = stateSingleTasksDefault, action) => {
    switch (action.type) {
      case DIARY_TASKS_RECEIVED: // params : data:IDiaryTasks
        return action.data;
      default:
        return state;
    }
  },
  actionPrefix
);

/**
 * Diary AllTasks Reducer : Manages the state of all the diaries' tasks.
 * Calls a diarySingleTasksReducer depends of given diaryId in actions.
 * This is NOT converted as an AsyncReducer, because the async data is stored for each diary.
 */
const diaryAllTasksReducerStateDefault: IAllDiaryTasksByDiaryIds = {};

const diaryAllTasksReducer = (
  state: IAllDiaryTasksByDiaryIds = diaryAllTasksReducerStateDefault,
  action
) => {
  switch (action.type) {
    case DIARY_TASKS_INVALIDATED: // params: diaryId:string
    case DIARY_TASKS_REQUESTED:
    case DIARY_TASKS_RECEIVED:
    case DIARY_TASKS_FETCH_ERROR:
      return {
        ...state,
        [action.diaryId]: diarySingleTasksReducer(state[action.diaryId], action)
      };
    default:
      return state;
  }
};

export default diaryAllTasksReducer;
