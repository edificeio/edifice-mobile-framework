import { combineReducers } from "redux";

import notifDefinitions, { INotifDefinitions_State } from "./notifDefinitions";

// State

export interface ITimeline_State {
  notifDefinitions: INotifDefinitions_State;
}

// Reducer

export default combineReducers({
  notifDefinitions
});
