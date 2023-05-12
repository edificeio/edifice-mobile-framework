import { CombinedState, combineReducers } from "redux";

import { INotifFilterSettings_State } from "./notifFilterSettings";
import notifFilterSettings from "./notifFilterSettings";
import pushNotifsSettings, { IPushNotifsSettings_State } from "./pushNotifsSettings";

// State

export type INotifSettings_State = CombinedState<{
    notifFilterSettings: INotifFilterSettings_State,
    pushNotifsSettings: IPushNotifsSettings_State
}>

// Reducer

export default combineReducers({
    notifFilterSettings,
    pushNotifsSettings
});

// Getters

export const getAreNotificationFilterSettingsLoaded = (state: INotifSettings_State) => state.notifFilterSettings.lastSuccess;