/**
 * Tasks by HomeworkId actions
 * Build actions to be dispatched to the homework tasks reducer.
 */

import { Conf } from "../../Conf";
import {
  actionTypeFetchError,
  actionTypeInvalidated,
  actionTypeReceived,
  actionTypeRequested
} from "../reducers/async";

import { IHomeworkTasks } from "../reducers/tasks";

import moment from "moment";
import today from "../../utils/today";

/** Retuns the local state (global state -> homework -> tasks). Give the global state as parameter. */
const localState = globalState => globalState.homework.tasks;

// ADAPTER ----------------------------------------------------------------------------------------

// Data type of what is given by the backend.
export interface IHomeworkTasksBackend {
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
const homeworkTasksAdapter: (data: IHomeworkTasksBackend) => IHomeworkTasks = data => {
  // Get all the backend homeworkDays.
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
    // each homeworkDay must have an id based on the date.
    const dateId = date.format("YYYY-MM-DD");
    // Now we generate the current homeworkDay (empty for the moment)
    const homeworkDay = {
      date,
      id: dateId,
      tasks: {
        byId: {},
        ids: []
      }
    };
    // Now it's time to iterate over the tasks of that day
    itemday.entries.forEach((itemtask, indextask) => {
      homeworkDay.tasks.ids.push(indextask);
      homeworkDay.tasks.byId[indextask] = {
        content: itemtask.value,
        id: indextask,
        title: itemtask.title
      };
    });
    // Now we put the homeworkDay into the return value
    ret.ids.push(dateId);
    ret.byId[dateId] = homeworkDay;
  }
  // Sorting days of tasks by ascending date
  ret.ids.sort(); // As the used ID from date is YYYY-MM-DD, we can sort it lexically.
  return ret;
};

// ACTION LIST ------------------------------------------------------------------------------------

export const actionPrefix = "HOMEWORK_TASKS";

export const HOMEWORK_TASKS_INVALIDATED = actionTypeInvalidated(actionPrefix);
export function homeworkTasksInvalidated(homeworkId: string) {
  return { type: HOMEWORK_TASKS_INVALIDATED, homeworkId };
}

export const HOMEWORK_TASKS_REQUESTED = actionTypeRequested(actionPrefix);
export function homeworkTasksRequested(homeworkId: string) {
  return { type: HOMEWORK_TASKS_REQUESTED, homeworkId };
}

export const HOMEWORK_TASKS_RECEIVED = actionTypeReceived(actionPrefix);
export function homeworkTasksReceived(homeworkId: string, data: IHomeworkTasks) {
  // console.warn("homework tasks received for " + homeworkId);
  return { type: HOMEWORK_TASKS_RECEIVED, homeworkId, data, receivedAt: Date.now() };
}

export const HOMEWORK_TASKS_FETCH_ERROR = actionTypeFetchError(actionPrefix);
export function homeworkTasksFetchError(homeworkId: string, errmsg: string) {
  return { type: HOMEWORK_TASKS_FETCH_ERROR, error: true, errmsg, homeworkId };
}

// THUNKS -----------------------------------------------------------------------------------------

/**
 * Returns a boolean to tell if we need to fetch data from the backend for the given homeworkId.
 * @param state current local state (global state -> homework -> tasks)
 * @param homeworkId homeworkId to fetch tasks.
 */
function shouldFetchHomeworkTasks(state, homeworkId: string) {
  // console.warn("Should fetch tasks for " + homeworkId + " ?");
  const thisHomeworkTasks = state[homeworkId];
  // console.warn(thisHomeworkTasks);
  if (!thisHomeworkTasks) {
    // console.warn("Yes. There are no homework tasks for this homework.");
    return true;
  } else if (thisHomeworkTasks.isFetching) {
    // console.warn("No. Already fetching homework tasks for this homework.");
    return false;
  } else {
    /* console.warn(
      thisHomeworkTasks.didInvalidate
        ? "Yes. Homework tasks invalidated for this homework."
        : "No. Homework tasks is already valid for this homework."
    ); */
    return thisHomeworkTasks.didInvalidate;
  }
}

/**
 * Calls a fetch operation to get homework tasks from the backend for the given homeworkId.
 * Dispatches HOMEWORK_TASKS_REQUESTED, HOMEWORK_TASKS_RECEIVED, and HOMEWORK_TASKS_FETCH_ERROR if an error occurs.
 */
export function fetchHomeworkTasks(homeworkId: string) {
  return async (dispatch, getState) => {
    // console.warn("Fetching homework tasks for homework " + homeworkId);
    dispatch(homeworkTasksRequested(homeworkId));

    try {
      const uri = `${Conf.platform}/homeworks/get/${homeworkId}`;
      const response = await fetch(uri, {
        method: "get"
      });
      const json = (await response.json()) as any;
      // console.warn(json);
      const data: IHomeworkTasks = homeworkTasksAdapter(json);
      // console.warn(data);

      dispatch(homeworkTasksReceived(homeworkId, data));
    } catch (errmsg) {
      dispatch(homeworkTasksFetchError(homeworkId, errmsg));
    }
  };
}

/**
 * Calls a fetch operation to get the homework tasks from the backend for the given homeworkId, only if needed data is not present or invalidated.
 */
export function fetchHomeworkTasksIfNeeded(homeworkId: string) {
  // console.warn("fetch tasks if neeeeeeeeded.");
  return (dispatch, getState) => {
    // console.warn(getState());
    if (shouldFetchHomeworkTasks(localState(getState()), homeworkId)) {
      return dispatch(fetchHomeworkTasks(homeworkId));
    }
  };
}
