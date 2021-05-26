/**
 * Timeline services
 */

import moment from "moment";
import queryString from "query-string";

import { fetchJSONWithCache } from "../../../../infra/fetchWithCache";
import { IUserSession } from "../../../session"
import { IEntcoreNotificationType } from "../reducer/notifDefinitions/notifTypes";
import { IEnrichedNotification, IEntcoreNotification, INotification, IResourceUriNotification, INamedResourceNotification, ISenderNotification } from "../reducer/notifications";

export const registeredNotificationsService = {
    list: async (session: IUserSession) => {
        const api = '/timeline/registeredNotifications';
        return fetchJSONWithCache(api) as Promise<IEntcoreNotificationType[]>;
    }
}

export const notificationAdapter = (n: IEntcoreNotification) => {
    const ret = {
        id: n._id,
        date: moment(n.date.$date),
        type: n.type,
        "event-type": n["event-type"],
        message: n.message,
        backupData: n
    } as INotification as unknown;
    if (n.sender && n.params.username) {
        (ret as ISenderNotification).sender = {
            id: n.sender,
            displayName: n.params.username!
        }
    }
    if (n.params.resourceUri) {
        (ret as IResourceUriNotification).resource = {
            uri: n.params.resourceUri!
        }
    }
    if (n.params.resourceUri && n.resource && n.params.resourceName) {
        (ret as INamedResourceNotification).resource = {
            uri: n.params.resourceUri!,
            id: n.resource,
            name: n.params.resourceName!
        }
    }
    if (n.preview) {
        (ret as IEnrichedNotification).preview = {
            text: n.preview.text,
            images: n.preview.images,
            media: n.preview.medias
        }
    }
    // ToDo Modules this with registered modules map
    return ret as INotification;
}

export const notificationsService = {
    page: async (session: IUserSession, page: number, filters: string[]) => {
        const url = '/timeline/lastNotifications';
        const query = {
            page,
            type: filters,
            both: 1
        };
        const api = queryString.stringifyUrl({ url, query });
        console.log("api", api);
        const headers = {
            // Accept: "application/json;version=2.0"
        }
        const entcoreNotifications = await fetchJSONWithCache(api, { headers }) as {results: IEntcoreNotification[], status: string, number: number};
        if (entcoreNotifications.status !== "ok") {
            throw new Error("[notificationsService.page] got status not ok from " + api);
        }
        // Run the notification adapter for each received notification
        return entcoreNotifications.results.map(n => notificationAdapter(n));
    }
}