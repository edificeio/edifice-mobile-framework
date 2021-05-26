import { Alert } from "react-native";
import { ThunkDispatch } from "redux-thunk";
import I18n from "i18n-js";

import Conf from "../../ode-framework-conf";
import { signedFetch } from "../infra/fetchWithCache";
import { mainNavNavigate } from "../navigation/helpers/navHelper";
import {
  conversationSetThreadRead,
  fetchConversationThreadAllMessages,
  fetchConversationThreadResetMessages,
  resetConversationThreadList
} from "./actions/threadList";
import conversationThreadSelected from "./actions/threadSelected";
import { NotificationHandlerFactory } from "../infra/pushNotification";
import { Trackers } from "../infra/tracker";
import conversationConfig from "./config";
import { AsyncState } from "../infra/redux/async2";
import { IConversationThreadList } from "./reducers/threadList";

//TODO add types args
const mailboxNotifHandlerFactory: NotificationHandlerFactory<any,any,any> = (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => async (notificationData, apps, doTrack) => {
  if (!notificationData.resourceUri.startsWith("/conversation")) {
    return false;
  }
  try {
    const localState = globalState =>
      conversationConfig.getLocalState(globalState).threadList as AsyncState<IConversationThreadList>;
    const threadListinfo = localState(getState());
    const threadListinfoById = threadListinfo.data.byId;
    if (!threadListinfoById) throw new Error("threadListinfoById is undefined");
    const threadListinfoByIdKeys =  Object.keys(threadListinfoById);
    const isthreadListinfoByIdEmpty =  threadListinfoByIdKeys.length === 0;

    const split = notificationData.resourceUri.split("/");
    const messageId = split[split.length - 1];
    if (!Conf.currentPlatform) throw new Error("must specify a platform");
    const messageResponse = await signedFetch(`${Conf.currentPlatform.url}/conversation/message/${messageId}`, {});
    const message = await messageResponse.json();
    const threadId = message.thread_id;
    if (!threadId) throw new Error("no thread id found");
    const isThreadLoaded = threadListinfoByIdKeys.includes(threadId);
    
    if (!isThreadLoaded) {
      if (isthreadListinfoByIdEmpty) {
        try {
          await dispatch(await resetConversationThreadList());
        } catch (e) {
          if (!(e.type && e.type === "ALREADY_FETCHED")) {
            throw e;
          }
        }
      }
      const response = await dispatch(await fetchConversationThreadAllMessages(threadId));
      if (response instanceof Error) throw response;
    }
    await dispatch(await conversationThreadSelected(threadId));
    isThreadLoaded && await dispatch(await fetchConversationThreadResetMessages(threadId));
    await dispatch(await conversationSetThreadRead(threadId, true));
    mainNavNavigate("thread");
  } catch (e) {
    const isThreadDeleted = e.message === "Thread deleted";
    console.warn(e);
    mainNavNavigate("listThreads");
    Alert.alert(
      I18n.t(isThreadDeleted ? "mailbox.alert.deletedThread.title" : "common.error.title"),
      I18n.t(isThreadDeleted ? "mailbox.alert.deletedThread.text" : "common.error.text"),
      [{ text: I18n.t("common.ok") }]
    );
  }
  const notifPathBegin = '/' + notificationData.resourceUri.replace(/^\/+/g, '').split('/')[0];
  doTrack && Trackers.trackEvent(doTrack, "Conversation", notifPathBegin);
  return true;
};
export default mailboxNotifHandlerFactory;
