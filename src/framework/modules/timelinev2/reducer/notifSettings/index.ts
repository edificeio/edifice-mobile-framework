

// State

import { combineReducers } from "redux";
import { INotifFilterSettings_State } from "./notifFilterSettings";
import notifFilterSettings from "./notifFilterSettings";

export interface INotifSettings_State {
    notifFilterSettings: INotifFilterSettings_State,
}

// Reducer

export default combineReducers({
    notifFilterSettings
});

// Getters


