// /**
//  * Diary entry deletion actions
//  */

import { Moment } from 'moment';
import { ThunkDispatch } from 'redux-thunk';

import homeworkConfig from '~/framework/modules/homework/module-config';
import { signedFetch } from '~/infra/fetchWithCache';
import { asyncActionTypes } from '~/infra/redux/async';

import { assertSession } from '../../auth/reducer';

// ACTION LIST ------------------------------------------------------------------------------------

export const actionTypes = asyncActionTypes(homeworkConfig.namespaceActionType('DELETE_ENTRY'));

export function homeworkDeleteEntryInvalidated() {
  return { type: actionTypes.invalidated };
}

export function homeworkDeleteEntryRequested() {
  return { type: actionTypes.requested };
}

export function homeworkDeleteEntryDeleted() {
  return { type: actionTypes.received, deletedAt: Date.now() };
}

export function homeworkDeleteEntryError(errmsg: string) {
  return { type: actionTypes.fetchError, error: true, errmsg };
}

// THUNKS -----------------------------------------------------------------------------------------

/**
 * Delete an entry within a given diary.
 * Info: no reducer is used in this action.
 */
export function deleteHomeworkDiaryEntry(diaryId: string, entryId: string, date: Moment) {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    const session = assertSession();

    dispatch(homeworkDeleteEntryRequested());
    try {
      await signedFetch(`${session?.platform.url}/homeworks/${diaryId}/entry/delete`, {
        method: 'PUT',
        body: JSON.stringify({
          date: date?.format('YYYY-MM-DD'),
          entryid: entryId,
        }),
      });
      dispatch(homeworkDeleteEntryDeleted());
    } catch (error) {
      dispatch(homeworkDeleteEntryError(error as string));
      throw error;
    }
  };
}
