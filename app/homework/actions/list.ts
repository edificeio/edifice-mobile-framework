/**
 * Homework diary list actions
 * Build actions to be dispatched to the homework diary list reducer.
 */

import { Conf } from "../../Conf";
import {
  actionTypeFetchError,
  actionTypeInvalidated,
  actionTypeReceived,
  actionTypeRequested
} from "../../infra/redux/async";

import { homeworkDiarySelected } from "./selectedDiary";

import { IHomeworkDiaryList } from "../reducers/diaryList";

/** Retuns the local state (global state -> homework -> diaryList). Give the global state as parameter. */
const localState = globalState => globalState.homework.diaryList;

// ADAPTER ----------------------------------------------------------------------------------------

// Data type of what is given by the backend.
export type IHomeworkDiaryListBackend = Array<{
  _id: string;
  title: string;
  thumbnail: string;
  trashed: number;
  name: string;
  owner: {
    userId: string;
    displayName: string;
  };
  created: {
    $date: number;
  };
  modified: {
    $date: number;
  };
  entriesModified: {
    $date: number;
  };
}>;

const homeworkDiaryListAdapter: (
  data: IHomeworkDiaryListBackend
) => IHomeworkDiaryList = data => {
  const result = {} as any;
  for (const item of data) {
    result[item._id] = {
      id: item._id,
      name: item.name,
      title: item.title
    };
  }
  return result;
};

// ACTION LIST ------------------------------------------------------------------------------------

export const actionPrefix = "HOMEWORK_DIARY_LIST";

export const HOMEWORK_DIARY_LIST_INVALIDATED = actionTypeInvalidated(
  actionPrefix
);
export function homeworkDiaryListInvalidated() {
  return { type: HOMEWORK_DIARY_LIST_INVALIDATED };
}

export const HOMEWORK_DIARY_LIST_REQUESTED = actionTypeRequested(actionPrefix);
export function homeworkDiaryListRequested() {
  return { type: HOMEWORK_DIARY_LIST_REQUESTED };
}

export const HOMEWORK_DIARY_LIST_RECEIVED = actionTypeReceived(actionPrefix);
export function homeworkDiaryListReceived(data: IHomeworkDiaryList) {
  return { type: HOMEWORK_DIARY_LIST_RECEIVED, data, receivedAt: Date.now() };
}

export const HOMEWORK_DIARY_LIST_FETCH_ERROR = actionTypeFetchError(
  actionPrefix
);
export function homeworkDiaryListFetchError(errmsg: string) {
  return { type: HOMEWORK_DIARY_LIST_FETCH_ERROR, error: true, errmsg };
}

// THUNKS -----------------------------------------------------------------------------------------

/**
 * Returns a boolean to tell if we need to fetch data from the backend.
 * @param state current local state (global state -> homework -> diaryList)
 */
function shouldFetchHomeworkDiaryList(state) {
  if (!state) {
    // console.warn("Yes. There are no homework diary list.");
    return true;
  } else if (state.isFetching) {
    // console.warn("No. Already fetching homework diary list.");
    return false;
  } else {
    /* console.warn(
      diaries.didInvalidate
        ? "Yes. Homework diary list invalidated."
        : "No. Homework diary list is already valid."
    ); */
    return state.didInvalidate;
  }
}

/**
 * Calls a fetch operation to get homework diary list from the backend.
 * Dispatches HOMEWORK_DIARY_LIST_REQUESTED, HOMEWORK_DIARY_LIST_RECEIVED, and HOMEWORK_DIARY_LIST_FETCH_ERROR if an error occurs.
 */
export function fetchHomeworkDiaryList() {
  return async (dispatch, getState) => {
    // console.warn("Fetching homework diary list...");
    dispatch(homeworkDiaryListRequested());

    try {
      const uri = `${Conf.platform}/homeworks/list`;
      const response = await fetch(uri, {
        method: "get"
      });
      const json = (await response.json()) as any;
      const data: IHomeworkDiaryList = homeworkDiaryListAdapter(json);

      dispatch(homeworkDiaryListReceived(data));

      // This block access to another chunk of state and fire action outside his scope. (homework -> selectedDiary)
      if (!getState().homework.selectedDiary) {
        dispatch(homeworkDiarySelected(Object.keys(data)[0]));
      }
    } catch (errmsg) {
      dispatch(homeworkDiaryListFetchError(errmsg));
    }
  };
}

/**
 * Calls a fetch operation to get the homework diary list from the backend, only if needed data is not present or invalidated.
 */
export function fetchHomeworkDiaryListIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchHomeworkDiaryList(localState(getState()))) {
      return dispatch(fetchHomeworkDiaryList());
    }
  };
}
