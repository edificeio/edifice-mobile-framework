/**
 * Homework list actions
 * Build actions to be dispatched to the homework list reducer.
 */

import { Conf } from "../../Conf";
import {
  actionTypeFetchError,
  actionTypeInvalidated,
  actionTypeReceived,
  actionTypeRequested
} from "../reducers/async";

import { homeworkSelected } from "./selected";

import { IHomeworkList } from "../reducers/list";

/** Retuns the local state (global state -> homework -> list). Give the global state as parameter. */
const localState = globalState => globalState.homework.list;

// ADAPTER ----------------------------------------------------------------------------------------

// Data type of what is given by the backend.
export type IHomeworkListBackend = Array<{
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
const homeworkListAdapter: (data: IHomeworkListBackend) => IHomeworkList = data => {
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

export const actionPrefix = "HOMEWORK_LIST";

export const HOMEWORK_LIST_INVALIDATED = actionTypeInvalidated(actionPrefix);
export function homeworkListInvalidated() {
  return { type: HOMEWORK_LIST_INVALIDATED };
}

export const HOMEWORK_LIST_REQUESTED = actionTypeRequested(actionPrefix);
export function homeworkListRequested() {
  return { type: HOMEWORK_LIST_REQUESTED };
}

export const HOMEWORK_LIST_RECEIVED = actionTypeReceived(actionPrefix);
export function homeworkListReceived(data: IHomeworkList) {
  return { type: HOMEWORK_LIST_RECEIVED, data, receivedAt: Date.now() };
}

export const HOMEWORK_LIST_FETCH_ERROR = actionTypeFetchError(actionPrefix);
export function homeworkListFetchError(errmsg: string) {
  return { type: HOMEWORK_LIST_FETCH_ERROR, error: true, errmsg };
}

// THUNKS -----------------------------------------------------------------------------------------

/**
 * Returns a boolean to tell if we need to fetch data from the backend.
 * @param state current local state (global state -> homework -> list)
 */
function shouldFetchHomeworkList(state) {
  if (!state) {
    // console.warn("Yes. There are no homework list.");
    return true;
  } else if (state.isFetching) {
    // console.warn("No. Already fetching homework list.");
    return false;
  } else {
    /* console.warn(
      diaries.didInvalidate
        ? "Yes. Homework list invalidated."
        : "No. Homework list is already valid."
    ); */
    return state.didInvalidate;
  }
}

/**
 * Calls a fetch operation to get homework list from the backend.
 * Dispatches HOMEWORK_LIST_REQUESTED, HOMEWORK_LIST_RECEIVED, and HOMEWORK_LIST_FETCH_ERROR if an error occurs.
 */
export function fetchHomeworkList() {
  return async (dispatch, getState) => {
    // console.warn("Fetching homework list...");
    dispatch(homeworkListRequested());

    try {
      const uri = `${Conf.platform}/homeworks/list`;
      const response = await fetch(uri, {
        method: "get"
      });
      const json = (await response.json()) as any;
      const data: IHomeworkList = homeworkListAdapter(json);

      dispatch(homeworkListReceived(data));

      // This block access to another chunk of state and fire action outside his scope. (homework -> selected)
      if (!getState().homework.selected) {
        dispatch(homeworkSelected(Object.keys(data)[0]));
      }
    } catch (errmsg) {
      dispatch(homeworkListFetchError(errmsg));
    }
  };
}

/**
 * Calls a fetch operation to get the homework list from the backend, only if needed data is not present or invalidated.
 */
export function fetchHomeworkListIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchHomeworkList(localState(getState()))) {
      return dispatch(fetchHomeworkList());
    }
  };
}
