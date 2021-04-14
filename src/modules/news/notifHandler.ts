/**
 * News notif handler
 */

import type { IResourceUriNotification, ITimelineNotification } from "../../framework/notifications";

import { NotifHandlerThunkAction, registerNotifHandlers } from "../../framework/notifications/routing";
import { mainNavNavigate } from "../../navigation/helpers/navHelper";

export interface INewsNotification extends ITimelineNotification, IResourceUriNotification {}

const handleBlogNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
	mainNavNavigate('news/details', {
		notification
	});
	return {
		managed: 1,
		trackInfo: { action: "News", name: `${notification.type}.${notification["event-type"]}` }
	}
}

export default () => registerNotifHandlers([
	{
		type: 'NEWS',
		"event-type": 'INFO-SHARED',
		notifHandlerAction: handleBlogNotificationAction
	}
]);
