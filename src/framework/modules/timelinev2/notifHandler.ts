/**
 * Timeline notif handler
 */

import { mainNavNavigate } from "../../../navigation/helpers/navHelper";
import { NotifHandlerThunkAction, registerNotifHandlers } from "../../util/notifications/routing";

const handleFlashMsgNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
	mainNavNavigate('timeline', {
		notification
	});
	return {
		managed: 1,
		trackInfo: { action: "Timeline", name: `${notification.type}.${notification["event-type"]}` }
	}
}

// Note : by default, unmanaged notifications leads to TimelineScreen.
// But, if this default behaviour is changed in the future, this notifHandler will prevent side-effect.

export default () => registerNotifHandlers([
	{
		type: 'TIMELINE',
		"event-type": 'SEND-FLASH-MESSAGE-PUSH',
		notifHandlerAction: handleFlashMsgNotificationAction
	}
]);
