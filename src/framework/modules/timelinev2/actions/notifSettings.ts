import { ThunkDispatch } from "redux-thunk";
import { getUserSession } from "../../../session";
import moduleConfig from "../moduleConfig";
import { ITimeline_State } from "../reducer";
import * as notifDefinitionsStateHandler from "../reducer/notifDefinitions";
import { loadNotificationsDefinitionsAction } from "./notifDefinitions";
import { actions as notifFilterSettingsActions, INotifFilterSettings } from "../reducer/notifSettings/notifFilterSettings"
import { getItemJson, setItemJson } from "../../../storage";

export const loadNotificationsSettingsAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
        dispatch(notifFilterSettingsActions.request());
        // 1 - Load notification definitions if necessary
        const session = getUserSession(getState());
        let state = moduleConfig.getState(getState()) as ITimeline_State;
        if (!notifDefinitionsStateHandler.getAreNotificationDefinitionsLoaded(state.notifDefinitions)) {
            await dispatch(loadNotificationsDefinitionsAction());
        }
        state = moduleConfig.getState(getState());

        // 2 - Load notif settings from Async Storage
        const asyncStorageKey = `${moduleConfig.name}.notifFilterSettings`;
        let settings: INotifFilterSettings = await getItemJson(asyncStorageKey);
        const defaults = Object.fromEntries(state.notifDefinitions.notifFilters.map(v => [v.type, true]));
        settings = {...defaults, ...settings};

        // 3 - Save loaded notif settings for persistency
        await setItemJson(asyncStorageKey, settings);
        dispatch(notifFilterSettingsActions.receipt(settings));
    } catch (e) {
        // ToDo: Error handling
        console.warn(`[${moduleConfig.name}] loadNotificationsSettingsAction failed`, e);
        dispatch(notifFilterSettingsActions.error(e));
    }
}

export const setFiltersAction = (selectedFilters: INotifFilterSettings) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
        const asyncStorageKey = `${moduleConfig.name}.notifFilterSettings`;
        dispatch(notifFilterSettingsActions.setRequest(selectedFilters));
        await setItemJson(asyncStorageKey, selectedFilters);
        dispatch(notifFilterSettingsActions.setReceipt(selectedFilters));
    } catch (e) {
        // ToDo: Error handling
        console.warn(`[${moduleConfig.name}] setFilterAction failed`, e);
        dispatch(notifFilterSettingsActions.setError(selectedFilters));
    }
}