import { NotifHandlerThunkAction, registerNotifHandlers } from "../../framework/util/notifications/routing";
import { mainNavNavigate } from "../../navigation/helpers/navHelper";

const handleZimbraNotificationAction: NotifHandlerThunkAction = notification => async (dispatch, getState) => {
  mainNavNavigate('zimbra/mailDetail', {
    notification,
  });
  return {
    managed: 1,
    trackInfo: { action: "Zimbra", name: `${notification.type}.${notification["event-type"]}` },
  };
};

export default () =>
  registerNotifHandlers([
    {
      type: 'ZIMBRA',
      "event-type": 'SEND-MESSAGE',
      notifHandlerAction: handleZimbraNotificationAction,
    },
  ]);
