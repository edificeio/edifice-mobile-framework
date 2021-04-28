import { CombinedState, combineReducers } from "redux";
import { INotificationFilter } from "./notifFilters";
import notifTypes, { INotifTypes_State } from "./notifTypes";
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

export const computeNotificationFilterList = (state: INotifDefinitions_State) => Object.values(
    state.notifTypes.data.reduce(
        (acc: { [type: string]: INotificationFilter }, v) => {
            acc = {
                ...acc,
                [v.type]: ({
                    type: v.type,
                    "app-name": v["app-name"],
                    "app-address": v["app-address"],
                    "push-notif": acc[v.type] && acc[v.type]["push-notif"] || v["push-notif"],
                    i18n: `timeline.filtersScreen.filters.${v.type}`
                } as INotificationFilter)
            }
            return acc;
        }, {}));
