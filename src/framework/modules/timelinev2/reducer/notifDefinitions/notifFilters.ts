

// State definition

import { Action } from "redux";
import { createSessionReducer } from "../../../../redux/reducerFactory";
import moduleConfig from "../../moduleConfig";

export interface INotificationFilter {
  type: string;
  "app-name": string | null;
  "app-address": string | null;
  "push-notif": boolean;
  i18n: string;
}

export type INotifFilters_State = INotificationFilter[];

// Reducer

const initialState: INotificationFilter[] = [];

export const actionTypes = {
  init: moduleConfig.namespaceActionType("NOTIFICATION_FILTERS_INIT"),
  clear: moduleConfig.namespaceActionType("NOTIFICATION_FILTERS_CLEAR"),
}

export const actions = {
  init: (filters: INotificationFilter[]) => ({ type: actionTypes.init, filters }),
  clear: () => ({ type: actionTypes.init }),
}

export default createSessionReducer(initialState, {
  [actionTypes.init]: (s, a) => {
    const action = a as Action & { filters: INotificationFilter[] }
    return action.filters;
  },
  [actionTypes.clear]: (s, a) => initialState
});
