/**
 * Notification list actions
 * Build actions to be dispatched to the notification list reducer.
 */

import { Dispatch } from "redux";

import pushNotifications from "../../pushNotifications";
import { INotificationList, INotification, actionTypes } from "../state/notificationList";
import { createAsyncActionCreators } from "../../infra/redux/async2";
import { notificationListService } from "../service/notificationList";

// ACTION LIST ------------------------------------------------------------------------------------

export const dataActions = createAsyncActionCreators<INotificationList>(actionTypes);

// THUNKS -----------------------------------------------------------------------------------------

/**
 * Calls a fetch operation to get notification list from the backend.
 * Dispatches NOTIFICATION_LIST_REQUESTED, NOTIFICATION_LIST_RECEIVED, and NOTIFICATION_LIST_FETCH_ERROR if an error occurs.
 */
export function fetchNotificationListAction() {
  return async (dispatch: Dispatch, getState: () => any) => {
    try {
      dispatch(dataActions.request());
      const availableApps = getState().user.auth.apps;
      const data = await notificationListService.get(availableApps);
      dispatch(dataActions.receipt(data));
    } catch (errmsg) {
      dispatch(dataActions.error(errmsg));
    }
  };
}

/**
 * Calls the main notif handler using the notification infos.
 */
export function handleNotificationAction(notification: INotification) {
  return async (dispatch: Dispatch, getState: () => any) => {
    try {
      const availableApps = getState().user.auth.apps;
      pushNotifications(dispatch)(notification.params, availableApps) // ToDo: Fix Type error here
    } catch (errmsg) {
      console.warn("Unable to redirect notification: ", errmsg)
    }
  }
}
