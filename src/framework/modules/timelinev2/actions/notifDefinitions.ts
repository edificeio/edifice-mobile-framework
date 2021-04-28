import { Dispatch } from "redux";
import { getUserSession } from "../../../util/session";
import moduleConfig from "../moduleConfig";
import { registeredNotificationsService } from "../service";
import { actions as notifTypesAsyncActions } from "../reducer/notifDefinitions/notifTypes";
import { actions as notifFiltersActions } from "../reducer/notifDefinitions/notifFilters";
import type { ITimeline_State } from "../reducer";
import { computeNotificationFilterList } from "../reducer/notifDefinitions";

export const loadNotificationsDefinitionsAction = () => async (dispatch: Dispatch, getState: () => any) => {
    try {
        // 1. Notif Types from entcore
        dispatch(notifTypesAsyncActions.request());
        const session = getUserSession(getState());
        const notificationTypes = await registeredNotificationsService.list(session);
        dispatch(notifTypesAsyncActions.receipt(notificationTypes));
        // 2. Computed Notif Filters
        let state = (moduleConfig.getState(getState()) as ITimeline_State).notifDefinitions;
        const notifFilters = computeNotificationFilterList(state);
        dispatch(notifFiltersActions.init(notifFilters));
    } catch (e) {
        console.warn(`[${moduleConfig.name}] loadNotificationsDefinitionsAction failed`, e);
        dispatch(notifTypesAsyncActions.error(e));
    }
}
