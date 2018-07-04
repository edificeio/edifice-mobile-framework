/**
 * Diary list actions
 * Build actions to be dispatched to the diary list reducer.
 */

import { Conf } from "../../Conf";
import {
  actionTypeFetchError,
  actionTypeInvalidated,
  actionTypeReceived,
  actionTypeRequested
} from "../reducers/async";

import { diarySelected } from "./selected";

import { IDiaryList } from "../reducers/list";

/** Retuns the local state (global state -> diary -> list). Give the global state as parameter. */
const localState = globalState => globalState.diary.list;

// ADAPTER ----------------------------------------------------------------------------------------

// Data type of what is given by the backend.
export type IDiaryListBackend = Array<{
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

/** The adapter MUST returns a brand-new object */
const diaryListAdapter = (data: IDiaryListBackend) => {
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

export const actionPrefix = "DIARY_LIST";

export const DIARY_LIST_INVALIDATED = actionTypeInvalidated(actionPrefix);
export function diaryListInvalidated() {
  return { type: DIARY_LIST_INVALIDATED };
}

export const DIARY_LIST_REQUESTED = actionTypeRequested(actionPrefix);
export function diaryListRequested() {
  return { type: DIARY_LIST_REQUESTED };
}

export const DIARY_LIST_RECEIVED = actionTypeReceived(actionPrefix);
export function diaryListReceived(data: IDiaryList) {
  return { type: DIARY_LIST_RECEIVED, data, receivedAt: Date.now() };
}

export const DIARY_LIST_FETCH_ERROR = actionTypeFetchError(actionPrefix);
export function diaryListFetchError(errmsg: string) {
  return { type: DIARY_LIST_FETCH_ERROR, error: true, errmsg };
}

// THUNKS -----------------------------------------------------------------------------------------

/**
 * Returns a boolean to tell if we need to fetch data from the backend.
 * @param state current local state (global state -> diary -> list)
 */
function shouldFetchDiaryList(state) {
  if (!state) {
    // console.warn("Yes. There are no diary list.");
    return true;
  } else if (state.isFetching) {
    // console.warn("No. Already fetching diary list.");
    return false;
  } else {
    /* console.warn(
      diaries.didInvalidate
        ? "Yes. Diary list invalidated."
        : "No. Diary list is already valid."
    ); */
    return state.didInvalidate;
  }
}

/**
 * Calls a fetch operation to get diary list from the backend.
 * Dispatches DIARY_LIST_REQUESTED, DIARY_LIST_RECEIVED, and DIARY_LIST_FETCH_ERROR if an error occurs.
 */
function fetchDiaryList() {
  return async (dispatch, getState) => {
    // console.warn("Fetching diary list...");
    dispatch(diaryListRequested());

    try {
      const uri = `${Conf.platform}/homeworks/list`;
      const response = await fetch(uri, {
        method: "get"
      });
      const json = (await response.json()) as any;
      const data: IDiaryList = diaryListAdapter(json);

      dispatch(diaryListReceived(data));

      // This block access to another chunk of state and fire action outside his scope. (diary -> selected)
      if (!getState().diary.selected) {
        dispatch(diarySelected(Object.keys(data)[0]));
      }
    } catch (errmsg) {
      dispatch(diaryListFetchError(errmsg));
    }
  };
}

/**
 * Calls a fetch operation to get the diary list from the backend, only if needed data is not present or invalidated.
 */
export function fetchDiaryListIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchDiaryList(localState(getState()))) {
      return dispatch(fetchDiaryList());
    }
  };
}
