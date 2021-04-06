import { CombinedState, combineReducers } from "redux";

import notifDefinitions, { INotifDefinitions_State } from "./notifDefinitions";
import notifSettings, { INotifSettings_State } from "./notifSettings";
import notifications, { INotifications_State } from "./notifications";
import flashMessages, { IFlashMessages_State } from "./flashMessages";
import { INotificationFilter } from "./notifDefinitions/notifFilters";

// State

export type ITimeline_State = CombinedState<{
  notifDefinitions: INotifDefinitions_State;
  notifSettings: INotifSettings_State;
  notifications: INotifications_State;
  flashMessages: IFlashMessages_State;
}>

export interface INotificationFilterWithSetting extends INotificationFilter {
  setting: boolean;
}

// Reducer

export default combineReducers({
  notifDefinitions,
  notifSettings,
  notifications,
  flashMessages
});

// Getters

export const getNotifFiltersWithSetting = (state: ITimeline_State) =>
  state.notifDefinitions.notifFilters.map(e => ({
    ...e,
    setting: state.notifSettings.notifFilterSettings.data[e.type]
  })) as INotificationFilterWithSetting[];
