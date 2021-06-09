import { NavigationActions } from "react-navigation";

import { NotifHandlerThunkAction, registerNotifHandlers } from "../../framework/util/notifications/routing";
import { NotificationHandlerFactory } from "../../infra/pushNotification";
import { Trackers } from "../../infra/tracker";
import { mainNavNavigate } from "../../navigation/helpers/navHelper";

//TODO add types args
const zimbraNotifHandlerFactory: NotificationHandlerFactory<any, any, any> = dispatch => async (
  notificationData,
  apps,
  trackCategory
) => {
  if (!notificationData.resourceUri.includes("/zimbra")) {
    return false;
  }
  const split = notificationData.resourceUri.split("/");
  const mailId = split[split.length - 1];
  const subject = notificationData["subject"];
  try {
    mainNavNavigate("mailDetail", {
      mailId,
      subject,
      onGoBack: () => {
        dispatch(NavigationActions.init());
      },
      isTrashed: false,
    });
  } catch (e) {
    console.warn(e);
    dispatch(NavigationActions.init());
  }
  const notifPathBegin = "/" + notificationData.resourceUri.replace(/^\/+/g, "").split("/")[0];
  console.log(notifPathBegin);
  trackCategory && Trackers.trackEvent(trackCategory, "Zimbra", notifPathBegin);
  return true;
};

export default zimbraNotifHandlerFactory;

/*export default () =>
  registerNotifHandlers([
    {
      type: "ZIMBRA",
      "event-type": "SEND-FLASH-MESSAGE-PUSH",
      notifHandlerAction: zimbraNotifHandlerFactory,
    },
  ]);*/




/**
 * Timeline notif handler
 */

/* import { mainNavNavigate } from "../../../navigation/helpers/navHelper";
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
 ]);*/