/**
 * List of actions & action creators & thucs for tasks of Homework/Diary app.
 */

import { Conf } from "../../Conf";
import { fetchDummyData } from "../dummyData";

export const DIARY_TASKS_INVALIDATED = "DIARY_TASKS_INVALIDATED";

export function diaryTasksInvalidated(diaryId) {
  console.warn("tasks invalidated.");
  return {
    type: DIARY_TASKS_INVALIDATED,

    diaryId
  };
}

export const DIARY_TASKS_REQUESTED = "DIARY_TASKS_REQUESTED";

function diaryTasksRequested(diaryId) {
  console.warn("tasks requested.");
  return {
    type: DIARY_TASKS_REQUESTED,

    diaryId
  };
}

export const DIARY_TASKS_RECEIVED = "DIARY_TASKS_RECEIVED";

function diaryTasksReceived(diaryId, tasks) {
  console.warn("tasks received.");
  return {
    type: DIARY_TASKS_RECEIVED,

    diaryId,
    receivedAt: Date.now(),
    tasks
  };
}

export const DIARY_TASKS_FETCH_ERROR = "DIARY_TASKS_FETCH_ERROR";

function diaryTasksFetchError(diaryId, errmsg) {
  console.warn("tasks fetch error : " + errmsg);
  return {
    error: true,
    type: DIARY_TASKS_FETCH_ERROR,

    diaryId,
    errmsg
  };
}

function shouldFetchDiaryTasks(state, diaryId) {
  // console.warn("shoud fetch tasks ?");
  const tasks = state.diary.diaryTasks;
  if (!tasks) {
    // console.warn("Yes. There are no tasks.");
    return true;
  } else if (tasks.isFetching) {
    // console.warn("No. Already fetching tasks.");
    return false;
  } else {
    /* console.warn(
      tasks.didInvalidate
        ? "Yes. Tasks invalidated."
        : "No. Tasks are already valid."
    ); */
    return tasks.didInvalidate;
  }
}

function fetchDiaryTasks(diaryId) {
  // console.warn("fetching tasks...");
  return async dispatch => {
    dispatch(diaryTasksRequested(diaryId));

    try {
      /*
      const response = await fetch(`${Conf.platform}/url/to/posts/${diaryId}`, {
        method: "get"
      });
      const json = await response.json;
      */

      const json = await fetchDummyData(0, 1); // HA HA yeah that's some dummy data ! Well replace this by the commented lines in the real version.
      const jsonTasks = json["ceci-est-un-id"].tasksByDay;
      dispatch(diaryTasksReceived(diaryId, jsonTasks));
    } catch (errmsg) {
      dispatch(diaryTasksFetchError(diaryId, errmsg));
    }
  };
}

export function fetchDiaryTasksIfNeeded(diaryId) {
  // console.warn("fetching if needed...");
  return (dispatch, getState) => {
    if (shouldFetchDiaryTasks(getState(), diaryId)) {
      return dispatch(fetchDiaryTasks(diaryId));
    }
  };
}
