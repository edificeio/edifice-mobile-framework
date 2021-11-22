import { CombinedState, combineReducers } from "redux";

import { IEntcoreApp } from "~/framework/util/moduleTool";

import { INotificationFilter } from "./notifFilters";
import notifTypes, { IEntcoreNotificationType, INotifTypes_State } from "./notifTypes";
import notifFilters, { INotifFilters_State } from "./notifFilters";

// State

export type INotifDefinitions_State = CombinedState<{
    notifTypes: INotifTypes_State,
    notifFilters: INotifFilters_State
}>

// Reducer

export default combineReducers({
    notifTypes,
    notifFilters
});

// State getters

export const getAreNotificationDefinitionsLoaded = (state: INotifDefinitions_State) => state.notifTypes.lastSuccess;

/**
 * Compute and populate all notification filters that exists in given notif definitions.
 */
export const computeNotificationFilterList = (filters: string[], notifTypes: IEntcoreNotificationType[]) => {
    const getFilterDetail = (filter: string, notifTypes: IEntcoreNotificationType[]) => {
        const matchingNotifType = notifTypes.find(nt => nt.type === filter);
        return matchingNotifType ? {
            type: filter,
            "app-name": matchingNotifType["app-name"],
            "app-address": matchingNotifType["app-address"],
            i18n: `timeline.appType.${filter}`
        } : undefined;
    }
    return filters.reduce<INotificationFilter[]>((acc, cur) => {
        const filterDetail = getFilterDetail(cur, notifTypes);
        return filterDetail ? [...acc, filterDetail] : acc;
    }, []);
}

/**
 * Filter a notificationFilterList with authorized entcore apps
 */
export const getAuthorizedNotificationFilterList = (notifFilters: INotificationFilter[], entcoreApps: IEntcoreApp[]) =>
    notifFilters.filter(nf => entcoreApps.find(ea => !nf["app-name"] || ea.name === nf["app-name"]));