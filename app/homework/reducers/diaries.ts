/**
 * List of reducers for diaries. (aka Homework)
 */

import { combineReducers } from "redux";

import { IDiaryDayTasks } from "./diaryTasks";

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
      console.warn("YEAH !");
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
