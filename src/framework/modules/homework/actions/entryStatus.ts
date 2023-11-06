// /**
//  * Diary entry status actions
//  */

import { ThunkDispatch } from 'redux-thunk';

import { assertSession } from '~/framework/modules/auth/reducer';
import homeworkConfig from '~/framework/modules/homework/module-config';
import { signedFetch } from '~/infra/fetchWithCache';
import { asyncActionTypes } from '~/infra/redux/async';

// ACTION LIST ------------------------------------------------------------------------------------

export const actionTypes = asyncActionTypes(homeworkConfig.namespaceActionType('TOGGLE_ENTRY_STATUS'));

export function homeworkToggleEntryStatusInvalidated(entryId: string) {
  return { type: actionTypes.invalidated, entryId };
}

export function homeworkToggleEntryStatusRequested(entryId: string) {
  return { type: actionTypes.requested, entryId };
}

export function homeworkToggleEntryStatusToggled(entryId: string) {
  return { type: actionTypes.received, entryId, toggledAt: Date.now() };
}

export function homeworkToggleEntryStatusError(entryId: string, errmsg: string) {
  return { type: actionTypes.fetchError, error: true, errmsg, entryId };
}

// THUNKS -----------------------------------------------------------------------------------------

/**
 * Toggle a diary entry's status.
 * Info: no reducer is used in this action.
 */
export function toggleHomeworkDiaryEntryStatus(diaryId: string, entryId: string, finished: boolean) {
  return async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    const session = assertSession();

    dispatch(homeworkToggleEntryStatusRequested(entryId));
    try {
      await signedFetch(`${session?.platform.url}/homeworks/${diaryId}/entry/status`, {
        method: 'PUT',
        body: JSON.stringify({
          entryid: entryId,
          finished,
        }),
      });
      dispatch(homeworkToggleEntryStatusToggled(entryId));
    } catch (error) {
      dispatch(homeworkToggleEntryStatusError(entryId, error as string));
      throw error;
    }
  };
}
