import { NavigationActions } from "react-navigation";

import { NotificationHandlerFactory } from "../infra/pushNotification";
import { Trackers } from "../infra/tracker";
import { mainNavNavigate } from "../navigation/helpers/navHelper";

//TODO add types args
const zimbraNotifHandlerFactory: NotificationHandlerFactory<any, any, any> = dispatch => async (
  notificationData,
  apps,
  doTrack
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
  doTrack && Trackers.trackEvent(doTrack, "Zimbra", notifPathBegin);
  return true;
};

export default zimbraNotifHandlerFactory;
