import Conf from "../../ode-framework-conf";
import { nainNavNavigate } from "../navigation/helpers/navHelper";
import { NotificationHandlerFactory } from "../infra/pushNotification";

const notifHandlerFactory :NotificationHandlerFactory<any,any,any> = dispatch => async notificationData => {
  console.log( "notif " + notificationData);

  if (!notificationData.resourceUri.startsWith("/workspace")) {
    return false;
  }
  const split = notificationData.resourceUri.split("/");
  const parentId = split[split.length - 1];
  if (!Conf.currentPlatform) throw new Error("must specify a platform");
  nainNavNavigate("workspace", { filter: null, parentId, title: "Notification" });
  return true;
};

export default notifHandlerFactory;
