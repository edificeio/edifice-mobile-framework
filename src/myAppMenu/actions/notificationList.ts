/**
 * Notification list actions
 * Build actions to be dispatched to the notification list reducer.
 */

import moment from "moment";
import {
  asyncActionTypes,
  asyncFetchIfNeeded,
  asyncGetJson
} from "../../infra/redux/async";
import pushNotifications from "../../pushNotifications";
import notificationConfig from "../config";

import { INotificationList, INotification } from "../reducers/notificationList";
import { removeAccents } from "../../utils/string";

/** Returns the local state (global state -> notification -> notificationList). Give the global state as parameter. */
const localState = globalState =>
  notificationConfig.getLocalState(globalState).notificationList;

// ADAPTER ----------------------------------------------------------------------------------------

// Data type of what is given by the backend.
export type INotificationListBackend = {
  number: string;
  results: Array<{
    date: {
      $date: number;
    };
    "event-type": string;
    message: string;
    params: {
      uri?: string;
      profilUri?: string;
      username?: string;
      resourceName?: string;
    };
    recipients: Array<{
      unread: number;
      userId: string;
    }>;
    resource: string;
    sender: string;
    type: string;
    _id: string;
  }>;
  status: string;
}

const notificationListAdapter: (
  data: INotificationListBackend
) => INotificationList = data => {
  let result = [] as INotificationList;
  if (!data) return result;
  result = data.results.map(item => ({
    id: item._id,
    date: moment(item.date.$date),
    eventType: item["event-type"],
    message: item.message,
    params: item.params,
    recipients: item.recipients,
    resource: item.resource,
    sender: item.sender,
    type: item.type
  }))
  return result;
};

// ACTION LIST ------------------------------------------------------------------------------------

export const actionTypes = asyncActionTypes(
  notificationConfig.createActionType("NOTIFICATION_LIST")
);

export function notificationListInvalidated() {
  return { type: actionTypes.invalidated };
}

export function notificationListRequested() {
  return { type: actionTypes.requested };
}

export function notificationListReceived(data: INotificationList) {
  return { type: actionTypes.received, data, receivedAt: Date.now() };
}

export function notificationListFetchError(errmsg: string) {
  return { type: actionTypes.fetchError, error: true, errmsg };
}

// THUNKS -----------------------------------------------------------------------------------------

/**
 * Calls a fetch operation to get notification list from the backend.
 * Dispatches NOTIFICATION_LIST_REQUESTED, NOTIFICATION_LIST_RECEIVED, and NOTIFICATION_LIST_FETCH_ERROR if an error occurs.
 */
export function fetchNotificationListAction() {
  return async (dispatch, getState) => {
    dispatch(notificationListRequested());

    try {
      const availableApps = getState().user.auth.apps;
      const appParams = availableApps.map((app: string) => {
        `&type=${removeAccents(app.replace(/\s/g, "").toUpperCase())}`
      })
      .join("")
      const data = await asyncGetJson(
        `/timeline/lastNotifications?page=0${appParams}`,
        notificationListAdapter
      );
      dispatch(notificationListReceived(data));
    } catch (errmsg) {
      dispatch(notificationListFetchError(errmsg));
    }
  };
}

/**
 * Calls the main notif handler using the notification infos.
 */
export function handleNotificationAction(notification: INotification) {
  return async (dispatch, getState) => {
    try {
      const availableApps = getState().user.auth.apps;
      pushNotifications(dispatch)(notification.params, availableApps)
    } catch (errmsg) {
      console.warn("Unable to redirect notification: ", errmsg)
    }
  }
}


/**
 * Calls a fetch operation to get the notification list from the backend, only if needed data is not present or invalidated.
 */
export function fetchNotificationListIfNeeded() {
  return asyncFetchIfNeeded(localState, fetchNotificationListAction);
}
