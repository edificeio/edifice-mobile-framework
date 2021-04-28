
// State

import { Moment } from "moment";
import { ImageURISource } from "react-native";
import { AsyncPagedState, createAsyncPagedActionCreators, createAsyncPagedActionTypes, createSessionAsyncPagedReducer } from "../../../redux/asyncPaged";
import { IUserSession } from "../../../session";
import moduleConfig from "../moduleConfig";

export interface IEntcoreNotification {
    _id: string;
    type: string;
    "event-type": string;
    recipients?: Array<{userId: string, unread: boolean}>,
    resource?: string;
    "sub-resource"?: string;
    sender?: string;
    params: {
        uri?: string;
        resourceUri?: string;
        resourceName?: string;
        username?: string;
        [key: string]: any;
    };
    date: {$date: string};
    message: string;
    preview?: {
        text: string;
        images: string[],
        medias: Array<{
            type: "image" | "video" | "audio" | "iframe" | "attachment";
            src: string;
            name?: string;
        }>
    }
}

export interface INotification {
    id: string;             // Notification unique ID
    date: Moment;           // Date of emission
    type: string;           // Type referring notifDefinitions
    "event-type": string;   // Custom event-type, in sense of a subtype
    message: string;        // Non-enriched content
    backupData: IEntcoreNotification;   // Original notification data as is
}

export interface ISenderNotification extends INotification {
    sender: {              // Sender information
        id: string;
        displayName: string;
    }
}

export interface IResourceUriNotification extends INotification {
    resource: {
        uri: string;
    }
}

export interface INamedResourceNotification extends IResourceUriNotification {
    resource: IResourceUriNotification["resource"] & {
        id: string;
        name: string;
    }
}

export interface IEnrichedNotification extends INotification {
    preview: {
        text: string;
        media: IMedia[];
        images: string[]; // Obsolete. Use media field instead.
    }
}

export interface IMedia {
    type: "image" | "video" | "audio" | "iframe" | "attachment";
    src: string | { src: ImageURISource; alt: string; };
    name?: string;
}

export type INotifications_State_Data = INotification[];
export type INotifications_State = AsyncPagedState<INotifications_State_Data>;

// Reducer

const initialState: INotifications_State_Data = [];
const pageSize = 25;

export const actionTypes = createAsyncPagedActionTypes(moduleConfig.namespaceActionType("NOTIFICATIONS"));
export const actions = createAsyncPagedActionCreators<INotifications_State_Data>(actionTypes);

export default createSessionAsyncPagedReducer(initialState, actionTypes, pageSize);

// Getters

export const isSenderNotification = (n: INotification) => !!(n as INotification & Partial<ISenderNotification>).sender;
export const getAsSenderNotification = (n: INotification) => isSenderNotification(n) && n as ISenderNotification;

export const isResourceUriNotification = (n: INotification) => !!(n as INotification & Partial<IResourceUriNotification>).resource;
export const getAsResourceUriNotification = (n: INotification) => isResourceUriNotification(n) && n as IResourceUriNotification;

export const isNamedResourceNotification = (n: INotification) => !!(n as INotification & Partial<INamedResourceNotification>).resource?.name;
export const getAsNamedResourceNotification = (n: INotification) => isNamedResourceNotification(n) && n as INamedResourceNotification;

export const isEnrichedNotification = (n: INotification) => !!(n as INotification & Partial<IEnrichedNotification>).preview;
export const getAsEnrichedNotification = (n: INotification) => isEnrichedNotification(n) && n as IEnrichedNotification;

export const isMyNotification = (n: ISenderNotification, u: IUserSession) => n.sender.id === u.user.id;