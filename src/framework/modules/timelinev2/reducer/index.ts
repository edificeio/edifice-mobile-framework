import { combineReducers } from "redux";

import notifDefinitions, { INotifDefinitions_State } from "./notifDefinitions";
import notifSettings, { INotifSettings_State } from "./notifSettings";

// State

export interface ITimeline_State {
  notifDefinitions: INotifDefinitions_State;
  notifSettings: INotifSettings_State;
}

// Reducer

export default combineReducers({
  notifDefinitions,
  notifSettings
});
