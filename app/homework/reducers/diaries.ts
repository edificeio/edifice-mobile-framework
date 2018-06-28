/**
 * List of reducers for diaries. (aka Homework)
 */

import { combineReducers } from "redux";

import moment from "moment";

export interface IDiary {
  id: string;
  tasksByDay: IDiaryDayTasks[];
}

export interface IDiaryArray {
  [id: string]: IDiary;
}

export interface IDiariesState {
  didInvalidate: boolean;
  isFetching: boolean;
  items: IDiaryArray;
  lastUpdated: Date;
}

export interface IDiaryTask {
  id: number;
  title: string;
  description: string;
}

export interface IDiaryDayTasks {
  moment: moment.Moment;
  tasks: { [id: string]: IDiaryTask };
}

import {
  AVAILABLE_DIARIES_FETCH_ERROR,
  AVAILABLE_DIARIES_INVALIDATED,
  AVAILABLE_DIARIES_RECEIVED,
  AVAILABLE_DIARIES_REQUESTED,
  DIARY_SELECTED
} from "../actions/diaries";

// TODO : by default, state is `undefined`. That's cool, the app will force the user to select a diary to display. Therefore, we must keep the info in a local storage or something like this.
function selectedDiary(state: string = /* null */ "ceci-est-un-id", action) {
  switch (action.type) {
    case DIARY_SELECTED:
      return action.diaryId;
    default:
      return state;
  }
}

function availableDiaries(
  state: IDiariesState = {
    didInvalidate: true,
    isFetching: false,
    items: {},
    lastUpdated: undefined
  },
  action
) {
  switch (action.type) {
    case AVAILABLE_DIARIES_INVALIDATED:
      return {
        ...state,
        didInvalidate: true
      };
    case AVAILABLE_DIARIES_REQUESTED:
      return {
        ...state,
        didInvalidate: false,
        isFetching: true
      };
    case AVAILABLE_DIARIES_RECEIVED:
      return {
        ...state,
        didInvalidate: false,
        isFetching: false,
        items: action.diaries,
        lastUpdated: action.receivedAt
      };
    case AVAILABLE_DIARIES_FETCH_ERROR:
      return {
        ...state,
        didInvalidate: true,
        isFetching: false
      };
    default:
      return state;
  }
}

export { availableDiaries, selectedDiary };

export default combineReducers({
  availableDiaries,
  selectedDiary
});

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
