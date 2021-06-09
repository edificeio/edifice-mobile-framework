import { createAsyncActionTypes } from "../../../../infra/redux/async2";
import viescoConfig from "../../moduleConfig";
import { ICallEventsListState } from "./events";

const notificationPrefix = viescoConfig.createActionType("NOTIFICATION");

export interface INotifiationChildren {
  childId: string;
  lateness: Array<any>,
  departure: Array<any>,
  no_reason: Array<any>,
  regularized: Array<any>,
  unregularized: Array<any>,
  notebooks: Array<any>,
  punishments: Array<any>,
  incidents: Array<any>,
  isPristine: boolean,
  error: string,
}

export const initialStateNotification = [
  {
    //childId: "",
    lateness: [],
    departure: [],
    no_reason: [],
    regularized: [],
    unregularized: [],
    notebooks: [],
    punishments: [],
    incidents: [],
    isPristine: true,
    error: "",
  },
];

export const childrenEventsActionsTypes = {
  //childId: notificationPrefix + "_GET_CHILDID",
  event: notificationPrefix + "_GET_EVENTS",
  notebook: notificationPrefix + "_GET_NOTEBOOKS",
  incident: notificationPrefix + "_GET_INCIDENTS",
  clear: notificationPrefix + "_CLEAR",
  error: notificationPrefix + "_ERROR",
};

export const relativeEventsActionsTypes = {
  childId: notificationPrefix,
  childrenEventsActionsTypes,
};

export const getNotificationEvents = (globalState: any) =>
  viescoConfig.getLocalState(globalState).presences.notification as INotifiationChildren[];

export const actionTypes = createAsyncActionTypes(notificationPrefix);
