/**
 * Blog notif handler
 */

import type { IResourceUriNotification, ITimelineNotification } from "../../framework/util/notifications";

import { NotifHandlerThunkAction, registerNotifHandlers } from "../../framework/util/notifications/routing";
import { mainNavNavigate } from "../../navigation/helpers/navHelper";

export interface IBlogNotification extends ITimelineNotification, IResourceUriNotification {}

const handleBlogNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
	mainNavNavigate('blog/details', {
		notification
	});
	return {
		managed: 1,
		trackInfo: { action: "Blog", name: `${notification.type}.${notification["event-type"]}` }
	}
}

export default () => registerNotifHandlers([
	{
		type: 'BLOG',
		"event-type": 'PUBLISH-POST',
		notifHandlerAction: handleBlogNotificationAction
	}
]);
