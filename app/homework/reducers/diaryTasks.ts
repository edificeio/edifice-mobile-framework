/**
 * List of reducers for tasks of Homework/Diary app.
 */

import moment from "moment";

export interface IDiaryTask {
  id: number;
  title: string;
  description: string;
}
export interface IDiaryDayTasks {
  moment: moment.Moment;
  tasks: IDiaryTask[];
}
export interface IDiaryTasksState {
  didInvalidate: boolean;
  isFetching: boolean;
  items: IDiaryDayTasks[];
  lastUpdated: Date;
}

import {
  DIARY_TASKS_FETCH_ERROR,
  DIARY_TASKS_INVALIDATED,
  DIARY_TASKS_RECEIVED,
  DIARY_TASKS_REQUESTED
} from "../actions/diaryTasks";

function diaryTasks(
  state: IDiaryTasksState = {
    didInvalidate: true,
    isFetching: false,
    items: [],
    lastUpdated: undefined
  },
  action
) {
  switch (action.type) {
    case DIARY_TASKS_INVALIDATED:
      return {
        ...state,
        didInvalidate: true
      };
    case DIARY_TASKS_REQUESTED:
      return {
        ...state,
        didInvalidate: false,
        isFetching: true
      };
    case DIARY_TASKS_RECEIVED:
      return {
        ...state,
        didInvalidate: false,
        isFetching: false,
        items: action.tasks,
        lastUpdated: action.receivedAt
      };
    case DIARY_TASKS_FETCH_ERROR:
      return {
        ...state,
        didInvalidate: true,
        isFetching: false
      };
    default:
      return state;
  }
}

export default diaryTasks;
