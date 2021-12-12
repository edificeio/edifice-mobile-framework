/**
 * Flash message list actions
 * Build actions to be dispatched to the flash message list reducer.
 */

import { Dispatch } from 'redux';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { fetchJSONWithCache, signedFetch } from '~/infra/fetchWithCache';
import { createAsyncActionCreators } from '~/infra/redux/async2';
import {
  IFlashMessageList,
  flashMessageListActionTypes,
  flashMessageMarkAsReadActionTypes,
  IFlashMessage,
} from '~/timeline/state/flashMessageList';

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<IFlashMessageList>(flashMessageListActionTypes);
export const markAsReadActions = createAsyncActionCreators<IFlashMessage>(flashMessageMarkAsReadActionTypes);
export const allFlashMessageActions = { ...dataActions, ...markAsReadActions };

// THUNKS -----------------------------------------------------------------------------------------

/**
 * Calls a fetch operation to get flash message list from the backend.
 * Dispatches FLASH_MESSAGES_REQUESTED, FLASH_MESSAGES_RECEIVED, and FLASH_MESSAGES_FETCH_ERROR if an error occurs.
 */
export function fetchFlashMessagesAction(clear: boolean = false) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(dataActions.request());
      const data = await fetchJSONWithCache('/timeline/flashmsg/listuser');
      clear && dispatch(dataActions.clear());
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}

/**
 * Calls a fetch operation to mark a flash message as read.
 * Dispatches FLASH_MESSAGES_REQUESTED, FLASH_MESSAGES_RECEIVED, and FLASH_MESSAGES_FETCH_ERROR if an error occurs.
 */
export function markFlashMessageAsReadAction(flashMessageId: string) {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(markAsReadActions.request());
      const data = await signedFetch(`${DEPRECATED_getCurrentPlatform()!.url}/timeline/flashmsg/${flashMessageId}/markasread`, {
        method: 'PUT',
      });
      dispatch(markAsReadActions.receipt(flashMessageId));
    } catch (errmsg) {
      dispatch(markAsReadActions.error(errmsg));
    }
  };
}
