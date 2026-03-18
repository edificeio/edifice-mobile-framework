// /**
//  * Diary entry deletion actions
//  */

import { Moment } from 'moment';
import { ThunkDispatch } from 'redux-thunk';

import homeworkConfig from '~/framework/modules/homework/module-config';
import { sessionFetch } from '~/framework/util/transport';
import { asyncActionTypes } from '~/infra/redux/async';

// ACTION LIST ------------------------------------------------------------------------------------

export const actionTypes = asyncActionTypes(homeworkConfig.namespaceActionType('DELETE_ENTRY'));

export function homeworkDeleteEntryInvalidated() {
  return { type: actionTypes.invalidated };
}

export function homeworkDeleteEntryRequested() {
  return { type: actionTypes.requested };
}

export function homeworkDeleteEntryDeleted() {
  return { deletedAt: Date.now(), type: actionTypes.received };
}

export function homeworkDeleteEntryError(errmsg: string) {
  return { errmsg, error: true, type: actionTypes.fetchError };
}

// THUNKS -----------------------------------------------------------------------------------------

/**
 * Delete an entry within a given diary.
 * Info: no reducer is used in this action.
 */
export function deleteHomeworkDiaryEntry(diaryId: string, entryId: string, date: Moment) {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    dispatch(homeworkDeleteEntryRequested());
    try {
      await sessionFetch(`/homeworks/${diaryId}/entry/delete`, {
        body: JSON.stringify({
          date: date?.format('YYYY-MM-DD'),
          entryid: entryId,
        }),
        method: 'PUT',
      });
      dispatch(homeworkDeleteEntryDeleted());
    } catch (error) {
      dispatch(homeworkDeleteEntryError(error as string));
      throw error;
    }
  };
}
