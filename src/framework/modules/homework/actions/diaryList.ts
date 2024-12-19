/**
 * Homework diary list actions
 * Build actions to be dispatched to the homework diary list reducer.
 */
import { homeworkDiarySelected } from './selectedDiary';

import homeworkConfig from '~/framework/modules/homework/module-config';
import { IHomeworkDiaryList } from '~/framework/modules/homework/reducers/diaryList';
import { asyncActionTypes, asyncFetchIfNeeded, asyncGetJson } from '~/infra/redux/async';

/** Returns the local state (global state -> homework -> diaryList). Give the global state as parameter. */
const localState = globalState => homeworkConfig.getState(globalState).diaryList;

// ADAPTER ----------------------------------------------------------------------------------------

// Data type of what is given by the backend.
export type IHomeworkDiaryListBackend = {
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
  shared?: ({
    [key: string]: boolean | string | undefined;
  } & {
    [key in 'userId' | 'groupId']: string;
  })[];
}[];

const homeworkDiaryListAdapter: (data: IHomeworkDiaryListBackend) => IHomeworkDiaryList = data => {
  const result = {} as any;
  if (!data) return result;
  for (const item of data) {
    if (item.trashed) continue;
    result[item._id] = {
      id: item._id,
      name: item.name,
      owner: item.owner,
      shared: item.shared,
      thumbnail: item.thumbnail,
      title: item.title,
    };
  }
  return result;
};

// ACTION LIST ------------------------------------------------------------------------------------

export const actionTypes = asyncActionTypes(homeworkConfig.namespaceActionType('DIARY_LIST'));

export function homeworkDiaryListInvalidated() {
  return { type: actionTypes.invalidated };
}

export function homeworkDiaryListRequested() {
  return { type: actionTypes.requested };
}

export function homeworkDiaryListReceived(data: IHomeworkDiaryList) {
  return { data, receivedAt: Date.now(), type: actionTypes.received };
}

export function homeworkDiaryListFetchError(errmsg: string) {
  return { errmsg, error: true, type: actionTypes.fetchError };
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
      const data = await asyncGetJson('/homeworks/list', homeworkDiaryListAdapter);
      dispatch(homeworkDiaryListReceived(data));

      // This block accesses to another chunk of state and fire action outside his scope. (homework -> selectedDiary)
      const dataIds = Object.keys(data);
      if (dataIds.length === 1) {
        dispatch(homeworkDiarySelected(dataIds[0]));
      }
    } catch (errmsg) {
      dispatch(homeworkDiaryListFetchError(errmsg as string));
    }
  };
}

/**
 * Calls a fetch operation to get the homework diary list from the backend, only if needed data is not present or invalidated.
 */
export function fetchHomeworkDiaryListIfNeeded() {
  return asyncFetchIfNeeded(localState, fetchHomeworkDiaryList);
}
