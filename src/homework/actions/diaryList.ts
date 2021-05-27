/**
 * Homework diary list actions
 * Build actions to be dispatched to the homework diary list reducer.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  asyncActionTypes,
  asyncFetchIfNeeded,
  asyncGetJson
} from "../../infra/redux/async";
import homeworkConfig from "../config";

import { homeworkDiarySelected } from "./selectedDiary";

import { IHomeworkDiaryList } from "../reducers/diaryList";

/** Returns the local state (global state -> homework -> diaryList). Give the global state as parameter. */
const localState = globalState =>
  homeworkConfig.getLocalState(globalState).diaryList;

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
  if (!data) return result;
  for (const item of data) {
    if (item.trashed) continue;
    result[item._id] = {
      id: item._id,
      name: item.name,
      title: item.title
    };
  }
  return result;
};

// ACTION LIST ------------------------------------------------------------------------------------

export const actionTypes = asyncActionTypes(
  homeworkConfig.createActionType("DIARY_LIST")
);

export function homeworkDiaryListInvalidated() {
  return { type: actionTypes.invalidated };
}

export function homeworkDiaryListRequested() {
  return { type: actionTypes.requested };
}

export function homeworkDiaryListReceived(data: IHomeworkDiaryList) {
  return { type: actionTypes.received, data, receivedAt: Date.now() };
}

export function homeworkDiaryListFetchError(errmsg: string) {
  return { type: actionTypes.fetchError, error: true, errmsg };
}

// THUNKS -----------------------------------------------------------------------------------------

/**
 * Calls a fetch operation to get homework diary list from the backend.
 * Dispatches HOMEWORK_DIARY_LIST_REQUESTED, HOMEWORK_DIARY_LIST_RECEIVED, and HOMEWORK_DIARY_LIST_FETCH_ERROR if an error occurs.
 */
export function fetchHomeworkDiaryList() {
  return async (dispatch, getState) => {
    dispatch(homeworkDiaryListRequested());

    try {
      const data = await asyncGetJson(
        "/homeworks/list",
        homeworkDiaryListAdapter
      );
      dispatch(homeworkDiaryListReceived(data));

      // This block accesses to another chunk of state and fire action outside his scope. (homework -> selectedDiary)
      const dataIds = Object.keys(data);
      let savedSelectedId = await AsyncStorage.getItem("diary-selected");
      if (savedSelectedId && !dataIds.includes(savedSelectedId)) {
        await AsyncStorage.removeItem("diary-selected");
        savedSelectedId = null;
      }
      if (dataIds.length > 0) {
        dispatch(homeworkDiarySelected(savedSelectedId || dataIds[0]));
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
  return asyncFetchIfNeeded(localState, fetchHomeworkDiaryList);
}
