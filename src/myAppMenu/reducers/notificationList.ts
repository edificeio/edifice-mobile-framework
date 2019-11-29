/**
 * Notification list state reducer
 * Holds a list of available notifications in a simple Array
 */
import moment from "moment";
import asyncReducer from "../../infra/redux/async";

import { actionTypes } from "../actions/notificationList";

// TYPE DEFINITIONS -------------------------------------------------------------------------------

export interface INotification {
  id: string;
  date: moment.Moment;
  eventType: string;
  message: string;
  params: {
    resourceUri: string;
    uri: string;
    username: string;
    wordTitle: string;
  };
  recipients: Array<{
    unread: number;
    userId: string;
  }>;
  resource: string;
  sender: string;
  type: string;
}
//TODO: add isRefreshing here? (like threadList reducer)
export type INotificationList = INotification[];

// THE REDUCER ------------------------------------------------------------------------------------

const stateDefault: INotificationList = [];

const notificationListReducer = (
  state: INotificationList = stateDefault,
  action
) => {
  switch (action.type) {
    case actionTypes.received:
      return action.data;
    default:
      return state;
  }
};

export default asyncReducer<INotificationList>(
  notificationListReducer,
  actionTypes
);
