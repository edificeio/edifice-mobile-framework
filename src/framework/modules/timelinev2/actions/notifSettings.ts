import { ThunkDispatch } from "redux-thunk";
import { getUserSession } from "../../../util/session";
import moduleConfig from "../moduleConfig";
import { ITimeline_State } from "../reducer";
import * as notifDefinitionsStateHandler from "../reducer/notifDefinitions";
import { loadNotificationsDefinitionsAction } from "./notifDefinitions";
import { actions as notifFilterSettingsActions, INotifFilterSettings } from "../reducer/notifSettings/notifFilterSettings"
import { actions as pushNotifsSettingsActions, IPushNotifsSettings } from "../reducer/notifSettings/pushNotifsSettings"
import { getItemJson, setItemJson, removeItemJson } from "../../../util/storage";
import { pushNotifsService } from "../service";
import { notifierShowAction } from "../../../util/notifier/actions";
import I18n from "i18n-js";

export const loadNotificationFiltersSettingsAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
        dispatch(notifFilterSettingsActions.request());
        const session = getUserSession(getState());
        const userId = session.user.id;
        // 1 - Load notification definitions if necessary
        let state = moduleConfig.getState(getState()) as ITimeline_State;
        if (!notifDefinitionsStateHandler.getAreNotificationDefinitionsLoaded(state.notifDefinitions)) {
            await dispatch(loadNotificationsDefinitionsAction());
        }
        state = moduleConfig.getState(getState());

        // 2 - Load notif settings from Async Storage
        const asyncStorageKey = `${moduleConfig.name}.notifFilterSettings.${userId}`;
        let settings: INotifFilterSettings | undefined = await getItemJson(asyncStorageKey);
        if (!settings) {
            // On first app launch, migrate old data (if exists) to new user-aware format
            const oldAsyncStorageKey = `${moduleConfig.name}.notifFilterSettings`;
            const settingsToMigrate: INotifFilterSettings | undefined = await getItemJson(oldAsyncStorageKey);
            if (settingsToMigrate) {
                await removeItemJson(oldAsyncStorageKey);
                settings = settingsToMigrate;
            } else settings = {};
        }
        const defaults = Object.fromEntries(state.notifDefinitions.notifFilters.data.map(v => [v.type, v.type === "MESSAGERIE" ? false : true])); // TODO: beautify 
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
        const session = getUserSession(getState());
        const userId = session.user.id;
        const asyncStorageKey = `${moduleConfig.name}.notifFilterSettings.${userId}`;
        dispatch(notifFilterSettingsActions.setRequest(selectedFilters));
        await setItemJson(asyncStorageKey, selectedFilters);
        dispatch(notifFilterSettingsActions.setReceipt(selectedFilters));
    } catch (e) {
        // ToDo: Error handling
        console.warn(`[${moduleConfig.name}] setFilterAction failed`, e);
        dispatch(notifFilterSettingsActions.setError(selectedFilters));
    }
}

export const loadPushNotifsSettingsAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
        dispatch(pushNotifsSettingsActions.request());
        const session = getUserSession(getState());
        // 1 - Load notification definitions if necessary
        let state = moduleConfig.getState(getState()) as ITimeline_State;
        if (!notifDefinitionsStateHandler.getAreNotificationDefinitionsLoaded(state.notifDefinitions)) {
            await dispatch(loadNotificationsDefinitionsAction());
        }
        state = moduleConfig.getState(getState());

        // 2 - Load notif settings from API
        let pushNotifsSettings = await pushNotifsService.list(session);
        dispatch(pushNotifsSettingsActions.receipt(pushNotifsSettings));
    } catch (e) {
        // ToDo: Error handling
        console.warn(`[${moduleConfig.name}] loadPushNotifsSettingsAction failed`, e);
        dispatch(pushNotifsSettingsActions.error(e));
    }
}

export const updatePushNotifsSettingsAction = (changes: IPushNotifsSettings) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
        console.log("updatePushNotifsSettingsAction");
        dispatch(pushNotifsSettingsActions.setRequest(changes));
        const session = getUserSession(getState());
        await pushNotifsService.set(session, changes);
        dispatch(pushNotifsSettingsActions.setReceipt(changes));
    } catch (e) {
        // ToDo: Error handling
        console.warn(`[${moduleConfig.name}] updatePushNotifsSettingsAction failed`, e);
        dispatch(pushNotifsSettingsActions.setError(e));
        dispatch(notifierShowAction({
            type: 'error',
            id: 'timeline/push-notifications',
            text: I18n.t('common.error.text')
        }));
    }
}