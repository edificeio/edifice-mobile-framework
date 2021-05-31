/**
 * Timeline services
 */

import queryString from "query-string";

import { fetchJSONWithCache } from "../../../../infra/fetchWithCache";
import { IUserSession } from "../../../session"
import { IEntcoreNotificationType } from "../reducer/notifDefinitions/notifTypes";
import { IEntcoreTimelineNotification, ITimelineNotification, notificationAdapter } from "../../../notifications";
import { IEntcoreFlashMessage } from "../reducer/flashMessages";

// Notifications

export const registeredNotificationsService = {
    list: async (session: IUserSession) => {
        const api = '/timeline/registeredNotifications';
        return fetchJSONWithCache(api) as Promise<IEntcoreNotificationType[]>;
    }
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
        const entcoreNotifications = await fetchJSONWithCache(api, { headers }) as {results: IEntcoreTimelineNotification[], status: string, number: number};
        if (entcoreNotifications.status !== "ok") {
            throw new Error("[notificationsService.page] got status not ok from " + api);
        }
        // Run the notification adapter for each received notification
        return entcoreNotifications.results.map(n => notificationAdapter(n) as ITimelineNotification);
    }
}

// Flash Messages

export const flashMessagesService = {
    list: async (session: IUserSession) => {
        const api = '/timeline/flashmsg/listuser';
        return fetchJSONWithCache(api) as Promise<IEntcoreFlashMessage[]>;
    },
    dismiss: async (session: IUserSession, flashMessageId: number) => {
        const api = `/timeline/flashmsg/${flashMessageId}/markasread`;
        return fetchJSONWithCache(api, { method: "PUT" }) as any;
    }
}
