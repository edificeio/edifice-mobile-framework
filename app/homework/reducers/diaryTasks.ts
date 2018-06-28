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
  tasks: { [id: string]: IDiaryTask };
}
export interface IDiaryTasksState {
  items: IDiaryDayTasks[];
}

import {
  DIARY_TASKS_FETCH_ERROR,
  DIARY_TASKS_INVALIDATED,
  DIARY_TASKS_RECEIVED,
  DIARY_TASKS_REQUESTED
} from "../actions/diaryTasks";

function diaryTasks(
  state: IDiaryTasksState = {
    // didInvalidate: true,
    // isFetching: false,
    items: [] // ,
    // lastUpdated: undefined
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

/**
 * Extract a short version of the task's description, to be shown on the landing homework page.
 * The short version stops at the first new line, or before SHORT_TASK_MAX_SIZE characters (without cutting words).
 * The short version DOES include the ending "..." if necessary.
 * @param description description to be shortened.
 */
export function extractShortTask(
  description,
  maxSize = SHORT_TASK_MAX_SIZE,
  newLineChar = NEW_LINE_CHARACTER
) {
  const firstLine = description.split(newLineChar, 1)[0];
  let trimmedFirstLine = (firstLine + " ").substr(0, maxSize);
  trimmedFirstLine = trimmedFirstLine.substr(
    0,
    Math.min(trimmedFirstLine.length, trimmedFirstLine.lastIndexOf(" "))
  );
  trimmedFirstLine = trimmedFirstLine.trim();
  if (trimmedFirstLine.length !== description.length) trimmedFirstLine += "...";
  return trimmedFirstLine;
}
const SHORT_TASK_MAX_SIZE: number = 70;
const NEW_LINE_CHARACTER: string = "\n";
