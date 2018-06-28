/**
 * List of actions & action creators & thucs for diaries.
 */

import { Conf } from "../../Conf";
import { fetchDummyData } from "../dummyData";

export const DIARY_SELECTED = "DIARY_SELECTED";

export function diarySelected(diaryId) {
  // console.warn("diary selected.");
  return {
    type: DIARY_SELECTED,

    diaryId
  };
}

export const AVAILABLE_DIARIES_INVALIDATED = "AVAILABLE_DIARIES_INVALIDATED";

export function availableDiariesInvalidated() {
  // console.warn("available diaries invalidated.");
  return {
    type: AVAILABLE_DIARIES_INVALIDATED
  };
}

export const AVAILABLE_DIARIES_REQUESTED = "AVAILABLE_DIARIES_REQUESTED";

export function availableDiariesRequested() {
  // console.warn("available diaries requested.");
  return {
    type: AVAILABLE_DIARIES_REQUESTED
  };
}

export const AVAILABLE_DIARIES_RECEIVED = "AVAILABLE_DIARIES_RECEIVED";

export function availableDiariesReceived(diaries) {
  // console.warn("available diaries received.");
  return {
    type: AVAILABLE_DIARIES_RECEIVED,

    diaries,
    receivedAt: Date.now()
  };
}

export const AVAILABLE_DIARIES_FETCH_ERROR = "AVAILABLE_DIARIES_FETCH_ERROR";

function availableDiariesFetchError(errmsg) {
  // tslint:disable-next-line:no-console
  console.warn("tasks fetch error : " + errmsg);
  return {
    error: true,
    type: AVAILABLE_DIARIES_FETCH_ERROR,

    errmsg
  };
}

function shouldFetchDiaries(state) {
  // console.warn("shoud fetch diaires ?");
  const diaries = state.diary.availableDiaries;
  if (!diaries) {
    // console.warn("Yes. There are no tasks.");
    return true;
  } else if (diaries.isFetching) {
    // console.warn("No. Already fetching tasks.");
    return false;
  } else {
    /* console.warn(
      diaries.didInvalidate
        ? "Yes. Tasks invalidated."
        : "No. Tasks are already valid."
    ); */
    return diaries.didInvalidate;
  }
}

function fetchDiaries() {
  // console.warn("fetching diaries...");
  return async dispatch => {
    dispatch(availableDiariesRequested());

    try {
      /*
      const response = await fetch(`${Conf.platform}/url/to/posts/${diaryId}`, {
        method: "get"
      });
      const json = await response.json;
      */
      const json = await fetchDummyData(0, 1); // HA HA yeah that's some dummy data ! Well replace this by the commented lines in the real version.
      dispatch(availableDiariesReceived(json));
    } catch (errmsg) {
      dispatch(availableDiariesFetchError(errmsg));
    }
  };
}

export function fetchDiariesIfNeeded() {
  // console.warn("fetching if needed...");
  return (dispatch, getState) => {
    if (shouldFetchDiaries(getState())) {
      return dispatch(fetchDiaries());
    }
  };
}
