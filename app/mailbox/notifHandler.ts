import { Conf } from "../Conf";
import { signedFetch } from "../infra/fetchWithCache";
import { nainNavNavigate } from "../navigation/helpers/navHelper";
import { fetchConversationThreadList, fetchConversationThreadResetMessages } from "./actions/threadList";
import conversationThreadSelected from "./actions/threadSelected";

export default dispatch => async notificationData => {
  console.log("MAILBOX NOTIF HANDLER");
  console.log(notificationData);
  if (!notificationData.resourceUri.startsWith("/conversation")) {
    return;
  }
  const split = notificationData.resourceUri.split("/");
  console.log(split);
  const messageId = split[split.length - 1];
  console.log(messageId);
  const response = await signedFetch(
    `${Conf.platform}/conversation/message/${messageId}`,
    {}
  );
  const message = await response.json();
  console.log(message);

  await dispatch(await fetchConversationThreadList());
  await dispatch(await conversationThreadSelected(message.thread_id));
  await dispatch(await fetchConversationThreadResetMessages(message.thread_id));
  nainNavNavigate("thread");
};
