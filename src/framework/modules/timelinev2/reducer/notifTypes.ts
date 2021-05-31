import { IEntcoreApp } from "../../../moduleTool";
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from "../../../redux/async";
import moduleConfig from "../moduleConfig";

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
export type INotificationType = IEntcoreNotificationType & IEntcoreApp;

export const actionTypes = createAsyncActionTypes(moduleConfig.namespaceActionType("NOTIFICATION_TYPES"));

const initialState: INotificationType[] = [];

export default createSessionAsyncReducer(initialState, actionTypes);

export const getAreNotificationTypesLoaded = (state: AsyncState<INotificationType[]>) => state.lastSuccess;
