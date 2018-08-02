/**
 * Homework tasks (by homeworkId) state reducer
 * Holds a list of task by day, by homeworkId in a double-array.
 */

import moment from "moment";

import asyncReducer, { actionTypeReceived, IAsyncReducer } from "./async";

import {
  actionPrefix,
  HOMEWORK_TASKS_FETCH_ERROR,
  HOMEWORK_TASKS_INVALIDATED,
  HOMEWORK_TASKS_RECEIVED,
  HOMEWORK_TASKS_REQUESTED
} from "../actions/tasks";

// TYPE DEFINITIONS -------------------------------------------------------------------------------

import { IArrayById, IHomeworkList } from "./list";

// TODO : move this. This is useful elsewhere.
export interface IOrderedArrayById<T extends { id: any }> {
  byId: { [id: string]: T };
  ids: string[];
}

// A single task.
export interface IHomeworkTask {
  id: string;
  title: string;
  content: string;
}

// All tasks of a day.
export type IHomeworkTaskArray = IOrderedArrayById<IHomeworkTask>;

// A single day with its task array.
export interface IHomeworkDay {
  id: string; // string version of `date` ("AAAA-MM-JJ")
  date: moment.Moment;
  tasks: IHomeworkTaskArray;
}

// All days of a homework.
export type IHomeworkTasks = IOrderedArrayById<IHomeworkDay>;

// All diaries
export interface IAllHomeworkTasksByHomeworkIds {
  [id: string]: IAsyncReducer<IHomeworkTasks>;
}

// THE REDUCER ------------------------------------------------------------------------------------

/**
 * Homework SingleTasks Reducer : A reducer that manage state for the task list of a single homework.
 * Does not store the homeworkId. Made to be incorporated in the homeworkAllTasksReducer as a dynamic reducer function.
 * This IS an async reducer.
 */

const stateSingleTasksDefault: IHomeworkTasks = { byId: {}, ids: [] };

const homeworkSingleTasksReducer = asyncReducer<IHomeworkTasks>(
  (state: IHomeworkTasks = stateSingleTasksDefault, action) => {
    switch (action.type) {
      case HOMEWORK_TASKS_RECEIVED: // params : data:IHomeworkTasks
        return action.data;
      default:
        return state;
    }
  },
  actionPrefix
);

/**
 * Homework AllTasks Reducer : Manages the state of all the diaries' tasks.
 * Calls a homeworkSingleTasksReducer depends of given homeworkId in actions.
 * This is NOT converted as an AsyncReducer, because the async data is stored for each homework.
 */
const homeworkAllTasksReducerStateDefault: IAllHomeworkTasksByHomeworkIds = {};

const homeworkAllTasksReducer = (
  state: IAllHomeworkTasksByHomeworkIds = homeworkAllTasksReducerStateDefault,
  action
) => {
  switch (action.type) {
    case HOMEWORK_TASKS_INVALIDATED: // params: homeworkId:string
    case HOMEWORK_TASKS_REQUESTED:
    case HOMEWORK_TASKS_RECEIVED:
    case HOMEWORK_TASKS_FETCH_ERROR:
      return {
        ...state,
        [action.homeworkId]: homeworkSingleTasksReducer(state[action.homeworkId], action)
      };
    default:
      return state;
  }
};

export default homeworkAllTasksReducer;
