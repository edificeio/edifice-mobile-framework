import { CombinedState, combineReducers } from "redux";

import notifDefinitions, { INotifDefinitions_State } from "./notifDefinitions";
import notifSettings, { INotifSettings_State } from "./notifSettings";
import notifications, {INotifications_State} from "./notifications";

// State

export type ITimeline_State = CombinedState<{
  notifDefinitions: INotifDefinitions_State;
  notifSettings: INotifSettings_State;
  notifications: INotifications_State;
}>

// Reducer

export default combineReducers({
  notifDefinitions,
  notifSettings,
  notifications
});
