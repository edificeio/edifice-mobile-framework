import { IAbstractNotification, IResourceIdNotification } from "../../framework/util/notifications";
import { NotifHandlerThunkAction, registerNotifHandlers } from "../../framework/util/notifications/routing";
import { mainNavNavigate } from "../../navigation/helpers/navHelper";
import moduleConfig from "./moduleConfig";

const handleConversationNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  mainNavNavigate(`${moduleConfig.routeName}/mail`, {
    notification,
    mailId: (notification as IResourceIdNotification).resource.id
  });
  return {
    managed: 1,
    trackInfo: { action: "Conversation", name: `${notification.type}.${notification["event-type"]}` },
  };
};

export default () =>
  registerNotifHandlers([
    {
      type: 'MESSAGERIE',
      "event-type": 'SEND-MESSAGE',
      notifHandlerAction: handleConversationNotificationAction,
    },
  ]);
