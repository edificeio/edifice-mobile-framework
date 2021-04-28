import { CombinedState, combineReducers } from "redux";
import { INotifFilterSettings_State } from "./notifFilterSettings";
import notifFilterSettings from "./notifFilterSettings";

// State

export type INotifSettings_State = CombinedState<{
    notifFilterSettings: INotifFilterSettings_State,
}>

// Reducer

export default combineReducers({
    notifFilterSettings
});

// Getters

export const getAreNotificationFilterSettingsLoaded = (state: INotifSettings_State) => state.notifFilterSettings.lastSuccess;