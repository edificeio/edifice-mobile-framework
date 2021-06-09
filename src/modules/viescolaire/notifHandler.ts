import { NotificationHandlerFactory } from "../../infra/pushNotification";

const notifHandlerFactory: NotificationHandlerFactory<any, any, any> = dispatch => async notificationData => {
  return true;
};

export default notifHandlerFactory;
