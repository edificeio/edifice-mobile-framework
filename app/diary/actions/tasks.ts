/**
 * Tasks by DiaryId actions
 * Build actions to be dispatched to the diary tasks reducer.
 */

import { Conf } from "../../Conf";
import {
  actionTypeFetchError,
  actionTypeInvalidated,
  actionTypeReceived,
  actionTypeRequested
} from "../reducers/async";

import { IDiaryTasks } from "../reducers/tasks";

import moment from "moment";
import today from "../../utils/today";

/** Retuns the local state (global state -> diary -> tasks). Give the global state as parameter. */
const localState = globalState => globalState.diary.tasks;

// ADAPTER ----------------------------------------------------------------------------------------

// Data type of what is given by the backend.
export interface IDiaryTasksBackend {
  _id: string;
  title: string;
  thumbnail: any; // unknown but unused here (I guess it's a string that represent the URL)
  trashed: number;
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
  data: Array<{
    date: string;
    entries: Array<{
      title: string;
      value: string;
    }>;
  }>;
}

/** The adapter MUST returns a brand-new object */
const diaryTasksAdapter: (data: IDiaryTasksBackend) => IDiaryTasks = data => {
  // Get all the backend diaryDays.
  const dataDays = data.data;
  const ret = {
    byId: {},
    ids: []
  };
  // Now it's time to iterate over the days.
  for (const itemday of dataDays) {
    if (itemday.entries.length === 0) continue; // If no tasks this day we skip it.
    const date = moment(itemday.date);
    if (date.isBefore(today(), "day")) continue; // ignore all days before today
    // each diaryDay must have an id based on the date.
    const dateId = date.format("YYYY-MM-DD");
    // Now we generate the current diaryDay (empty for the moment)
    const diaryDay = {
      date,
      id: dateId,
      tasks: {
        byId: {},
        ids: []
      }
    };
    // Now it's time to iterate over the tasks of that day
    itemday.entries.forEach((itemtask, indextask) => {
      diaryDay.tasks.ids.push(indextask);
      diaryDay.tasks.byId[indextask] = {
        content: itemtask.value,
        id: indextask,
        title: itemtask.title
      };
    });
    // Now we put the diaryDay into the return value
    ret.ids.push(dateId);
    ret.byId[dateId] = diaryDay;
  }
  // Sorting days of tasks by ascending date
  ret.ids.sort(); // As the used ID from date is YYYY-MM-DD, we can sort it lexically.
  return ret;
};

// ACTION LIST ------------------------------------------------------------------------------------

export const actionPrefix = "DIARY_TASKS";

export const DIARY_TASKS_INVALIDATED = actionTypeInvalidated(actionPrefix);
export function diaryTasksInvalidated(diaryId: string) {
  return { type: DIARY_TASKS_INVALIDATED, diaryId };
}

export const DIARY_TASKS_REQUESTED = actionTypeRequested(actionPrefix);
export function diaryTasksRequested(diaryId: string) {
  return { type: DIARY_TASKS_REQUESTED, diaryId };
}

export const DIARY_TASKS_RECEIVED = actionTypeReceived(actionPrefix);
export function diaryTasksReceived(diaryId: string, data: IDiaryTasks) {
  // console.warn("diary tasks received for " + diaryId);
  return { type: DIARY_TASKS_RECEIVED, diaryId, data, receivedAt: Date.now() };
}

export const DIARY_TASKS_FETCH_ERROR = actionTypeFetchError(actionPrefix);
export function diaryTasksFetchError(diaryId: string, errmsg: string) {
  return { type: DIARY_TASKS_FETCH_ERROR, error: true, errmsg, diaryId };
}

// THUNKS -----------------------------------------------------------------------------------------

/**
 * Returns a boolean to tell if we need to fetch data from the backend for the given diaryId.
 * @param state current local state (global state -> diary -> tasks)
 * @param diaryId diaryId to fetch tasks.
 */
function shouldFetchDiaryTasks(state, diaryId: string) {
  // console.warn("Should fetch tasks for " + diaryId + " ?");
  const thisDiaryTasks = state[diaryId];
  // console.warn(thisDiaryTasks);
  if (!thisDiaryTasks) {
    // console.warn("Yes. There are no diary tasks for this diary.");
    return true;
  } else if (thisDiaryTasks.isFetching) {
    // console.warn("No. Already fetching diary tasks for this diary.");
    return false;
  } else {
    /* console.warn(
      thisDiaryTasks.didInvalidate
        ? "Yes. Diary tasks invalidated for this diary."
        : "No. Diary tasks is already valid for this diary."
    ); */
    return thisDiaryTasks.didInvalidate;
  }
}

/**
 * Calls a fetch operation to get diary tasks from the backend for the given diaryId.
 * Dispatches DIARY_TASKS_REQUESTED, DIARY_TASKS_RECEIVED, and DIARY_TASKS_FETCH_ERROR if an error occurs.
 */
export function fetchDiaryTasks(diaryId: string) {
  return async (dispatch, getState) => {
    // console.warn("Fetching diary tasks for diary " + diaryId);
    dispatch(diaryTasksRequested(diaryId));

    try {
      const uri = `${Conf.platform}/homeworks/get/${diaryId}`;
      const response = await fetch(uri, {
        method: "get"
      });
      const json = (await response.json()) as any;
      // console.warn(json);
      const data: IDiaryTasks = diaryTasksAdapter(json);
      // console.warn(data);

      dispatch(diaryTasksReceived(diaryId, data));
    } catch (errmsg) {
      dispatch(diaryTasksFetchError(diaryId, errmsg));
    }
  };
}

/**
 * Calls a fetch operation to get the diary tasks from the backend for the given diaryId, only if needed data is not present or invalidated.
 */
export function fetchDiaryTasksIfNeeded(diaryId: string) {
  // console.warn("fetch tasks if neeeeeeeeded.");
  return (dispatch, getState) => {
    // console.warn(getState());
    if (shouldFetchDiaryTasks(localState(getState()), diaryId)) {
      return dispatch(fetchDiaryTasks(diaryId));
    }
  };
}
