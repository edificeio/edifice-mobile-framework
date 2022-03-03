import { createAsyncActionTypes } from '~/infra/redux/async2';
import viescoConfig from '~/modules/viescolaire/moduleConfig';

const notificationPrefix = viescoConfig.createActionType('NOTIFICATION');

export interface INotifiationChildren {
  childId: string;
  lateness: any[];
  departure: any[];
  no_reason: any[];
  regularized: any[];
  unregularized: any[];
  notebooks: any[];
  punishments: any[];
  incidents: any[];
  isPristine: boolean;
  error: string;
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
    error: '',
  },
];

export const childrenEventsActionsTypes = {
  //childId: notificationPrefix + "_GET_CHILDID",
  event: notificationPrefix + '_GET_EVENTS',
  notebook: notificationPrefix + '_GET_NOTEBOOKS',
  incident: notificationPrefix + '_GET_INCIDENTS',
  clear: notificationPrefix + '_CLEAR',
  error: notificationPrefix + '_ERROR',
};

export const relativeEventsActionsTypes = {
  childId: notificationPrefix,
  childrenEventsActionsTypes,
};

export const getNotificationEvents = (globalState: any) =>
  viescoConfig.getState(globalState).presences.notification as INotifiationChildren[];

export const actionTypes = createAsyncActionTypes(notificationPrefix);
