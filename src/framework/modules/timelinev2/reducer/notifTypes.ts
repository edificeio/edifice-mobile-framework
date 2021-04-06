import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from "../../../redux/async";
import moduleConfig from "../moduleConfig";

// State definition

export interface IEntcoreNotificationType {
    type: string;
    "event-type": string;
    "app-name": string | null;
    "app-address": string | null;
    defaultFrequency: string;
    restriction: string;
    "push-notif": boolean;
    key: string;
}

export interface INotificationFilter {
    type: string;
    "app-name": string | null;
    "app-address": string | null;
    "push-notif": boolean;
    i18n: string;
}

export type INotifTypesState = IEntcoreNotificationType[];

export const actionTypes = createAsyncActionTypes(moduleConfig.namespaceActionType("NOTIFICATION_TYPES"));

const initialState: INotifTypesState = [];

export default createSessionAsyncReducer(initialState, actionTypes);

// State getters

export const getAreNotificationTypesLoaded = (state: AsyncState<INotifTypesState>) => state.lastSuccess;

export const getNotificationFilterList = (state: AsyncState<INotifTypesState>) => state.data.reduce(
    (acc: { [type: string]: INotificationFilter }, v) => {
        acc = {
            ...acc,
            [v.type]: ({
                type: v.type,
                "app-name": v["app-name"],
                "app-address": v["app-address"],
                "push-notif": acc[v.type] && acc[v.type]["push-notif"] || v["push-notif"],
                i18n: `timeline.notifType.${v.type}`
            } as INotificationFilter)
        }
        return acc;
    }, {});
