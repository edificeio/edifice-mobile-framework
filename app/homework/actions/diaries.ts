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

export const DIARY_LIST_INVALIDATED = "DIARY_LIST_INVALIDATED";

export function diaryListInvalidated() {
  // console.warn("available diaries invalidated.");
  return {
    type: DIARY_LIST_INVALIDATED
  };
}

export const DIARY_LIST_REQUESTED = "DIARY_LIST_REQUESTED";

export function diaryListRequested() {
  // console.warn("available diaries requested.");
  return {
    type: DIARY_LIST_REQUESTED
  };
}

export const DIARY_LIST_RECEIVED = "DIARY_LIST_RECEIVED";

export function diaryListReceived(diaries) {
  // console.warn("available diaries received.");
  return {
    type: DIARY_LIST_RECEIVED,

    diaries,
    receivedAt: Date.now()
  };
}

export const DIARY_LIST_FETCH_ERROR = "DIARY_LIST_FETCH_ERROR";

function diaryListFetchError(errmsg) {
  // tslint:disable-next-line:no-console
  console.warn("tasks fetch error : " + errmsg);
  return {
    error: true,
    type: DIARY_LIST_FETCH_ERROR,

    errmsg
  };
}

function shouldFetchDiaryList(state) {
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

function fetchDiaryList() {
  // console.warn("fetching diaries...");
  return async dispatch => {
    dispatch(diaryListRequested());

    try {
      const uri = `${Conf.platform}/homeworks/list`;
      const response = await fetch(uri, {
        method: "get"
      });
      const json = await response.json;

      // const json = await fetchDummyData(0, 1); // HA HA yeah that's some dummy data ! Well replace this by the commented lines in the real version.
      dispatch(diaryListReceived(json));
    } catch (errmsg) {
      dispatch(diaryListFetchError(errmsg));
    }
  };
}

export function fetchDiaryListIfNeeded() {
  // console.warn("fetching if needed...");
  return (dispatch, getState) => {
    if (shouldFetchDiaryList(getState())) {
      return dispatch(fetchDiaryList());
    }
  };
}
