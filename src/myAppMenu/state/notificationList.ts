import moment from "moment";
import notificationConfig from "../config";
import { createAsyncActionTypes, AsyncState } from "../../infra/redux/async2";

// THE MODEL --------------------------------------------------------------------------------------

export interface INotification {
  id: string;
  date: moment.Moment;
  eventType: string;
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
}

export type INotificationList = INotification[];

// THE STATE --------------------------------------------------------------------------------------

export type INotificationListState = AsyncState<INotificationList>;

export const initialState: INotificationList = [];

/** Returns the sub local state (global state -> notification -> notificationList). Give the global state as parameter. */
export const getNotificationListState = (globalState: any) =>
  notificationConfig.getLocalState(globalState).notificationList as INotificationListState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(
  notificationConfig.createActionType('NOTIFICATION_LIST')
);
