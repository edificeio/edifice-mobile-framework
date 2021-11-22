import { Dispatch } from "redux";
import { getUserSession } from "~/framework/util/session";
import moduleConfig from "../moduleConfig";
import { notifFiltersService, registeredNotificationsService } from "../service";
import { actions as notifTypesAsyncActions } from "../reducer/notifDefinitions/notifTypes";
import { actions as notifFiltersAsyncActions } from "../reducer/notifDefinitions/notifFilters";
import { computeNotificationFilterList, getAuthorizedNotificationFilterList } from "../reducer/notifDefinitions";

export const loadNotificationsDefinitionsAction = () => async (dispatch: Dispatch, getState: () => any) => {
    try {
        const session = getUserSession(getState());
        // 1. Fetch notif filters from backend
        dispatch(notifFiltersAsyncActions.request());
        const filters = await notifFiltersService.list(session);
        // 1a. Fetch notif types from backend
        try {
            dispatch(notifTypesAsyncActions.request());
            var notificationTypes = await registeredNotificationsService.list(session);
            dispatch(notifTypesAsyncActions.receipt(notificationTypes));
        } catch (e) {
            dispatch(notifTypesAsyncActions.error(e));
            throw e;
        }
        // 1b. Filter notif filters (That sounds odd...) + get app info
        let detailedFilters = computeNotificationFilterList(filters, notificationTypes);
        // 1c. Keep only userauthorized filters
        detailedFilters = getAuthorizedNotificationFilterList(detailedFilters, session.user.entcoreApps);
        // 2. Validate data
        dispatch(notifFiltersAsyncActions.receipt(detailedFilters));
    } catch (e) {
        console.warn(`[${moduleConfig.name}] loadNotificationsDefinitionsAction failed`, e);
        dispatch(notifFiltersAsyncActions.error(e));
    }
}
