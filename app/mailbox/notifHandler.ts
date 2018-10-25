import { Conf } from "../Conf";
import { signedFetch } from "../infra/fetchWithCache";
import { navigate } from "../navigation/helpers/navHelper";
import conversationThreadSelected from "./actions/threadSelected";

export default dispatch => async notificationData => {
  if (!notificationData.resourceUri.startsWith("/conversation")) {
    return;
  }
  const split = notificationData.resourceUri.split("/");
  const messageId = split[split.length - 1];
  const response = await signedFetch(
    `${Conf.platform}/conversation/message/${messageId}`,
    {}
  );
  const message = await response.json();
  dispatch(conversationThreadSelected(message.thread_id));
  navigate("thread");
};
