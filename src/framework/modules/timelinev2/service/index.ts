/**
 * Timeline services
 */

import { fetchJSONWithCache } from "../../../../infra/fetchWithCache";
import { IUserSession } from "../../../session"
import { IEntcoreNotificationType } from "../reducer/notifDefinitions/notifTypes";

export const registeredNotificationsService = {
    list: async (session: IUserSession) => {
        const url = '/timeline/registeredNotifications';
        return fetchJSONWithCache(url) as Promise<IEntcoreNotificationType[]>;
    }
}
