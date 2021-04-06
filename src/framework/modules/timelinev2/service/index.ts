/**
 * Timeline services
 */

import { fetchJSONWithCache } from "../../../../infra/fetchWithCache";
import { IUserSession } from "../../../session"
import { IEntcoreNotificationType, INotificationType } from "../state/notifTypes";

export const registeredNotificationsService = {
    list: async (session: IUserSession) => {
        const url = '/timeline/registeredNotifications';
        const res = await fetchJSONWithCache(url);
        return (res as IEntcoreNotificationType[]).map(
            nt => ({ ...nt, ...session.user.entcoreApps.find(app => app.address === nt["app-address"]) })
        ) as INotificationType[];
    }
}
