/**
 * Homework tasks (by diaryId) state reducer
 * Holds a list of task by day, by diaryId in a double-array.
 */

import moment from "moment";

import asyncReducer, { IAsyncReducer } from "../../infra/redux/async";

import { actionTypes } from "../actions/tasks";

// TYPE DEFINITIONS -------------------------------------------------------------------------------

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
 * Homework SingleTasks Reducer : A reducer that manage state for the task list of a single homework diary.
 * Does not store the diaryId. Made to be incorporated in the homeworkAllTasksReducer as a dynamic reducer function.
 * This IS an async reducer.
 */

const stateSingleTasksDefault: IHomeworkTasks = { byId: {}, ids: [] };

const homeworkSingleTasksReducer = asyncReducer<IHomeworkTasks>(
  (state: IHomeworkTasks = stateSingleTasksDefault, action) => {
    switch (action.type) {
      case actionTypes.received: // params : data:IHomeworkTasks
        return action.data;
      default:
        return state;
    }
  },
  actionTypes
);

/**
 * Homework AllTasks Reducer : Manages the state of all the diaries' tasks.
 * Calls a homeworkSingleTasksReducer depends of given homeworkId in actions.
 * This is NOT converted as an AsyncReducer, because the async data is stored for each homework diary.
 */
const homeworkAllTasksReducerStateDefault: IAllHomeworkTasksByHomeworkIds = {};

const homeworkAllTasksReducer = (
  state: IAllHomeworkTasksByHomeworkIds = homeworkAllTasksReducerStateDefault,
  action
) => {
  switch (action.type) {
    case actionTypes.invalidated: // params: homeworkId:string
    case actionTypes.requested:
    case actionTypes.received:
    case actionTypes.fetchError:
      return {
        ...state,
        [action.diaryId]: homeworkSingleTasksReducer(
          state[action.diaryId],
          action
        )
      };
    default:
      return state;
  }
};

export default homeworkAllTasksReducer;
