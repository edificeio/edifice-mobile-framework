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
  return { entryId, type: actionTypes.invalidated };
}

export function homeworkToggleEntryStatusRequested(entryId: string) {
  return { entryId, type: actionTypes.requested };
}

export function homeworkToggleEntryStatusToggled(entryId: string) {
  return { entryId, toggledAt: Date.now(), type: actionTypes.received };
}

export function homeworkToggleEntryStatusError(entryId: string, errmsg: string) {
  return { entryId, errmsg, error: true, type: actionTypes.fetchError };
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
        body: JSON.stringify({
          entryid: entryId,
          finished,
        }),
        method: 'PUT',
      });
      dispatch(homeworkToggleEntryStatusToggled(entryId));
    } catch (error) {
      dispatch(homeworkToggleEntryStatusError(entryId, error as string));
      throw error;
    }
  };
}
