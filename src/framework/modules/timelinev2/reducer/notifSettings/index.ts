import { combineReducers } from "redux";
import { INotifFilterSettings_State } from "./notifFilterSettings";
import notifFilterSettings from "./notifFilterSettings";

// State

export interface INotifSettings_State {
    notifFilterSettings: INotifFilterSettings_State,
}

// Reducer

export default combineReducers({
    notifFilterSettings
});

// Getters

export const getAreNotificationFilterSettingsLoaded = (state: INotifSettings_State) => state.notifFilterSettings.lastSuccess;