import moment from "moment";
import generateUuid from "../../utils/uuid";

import Conf from "../../../ode-framework-conf";
import { signedFetch } from "../../infra/fetchWithCache";

import mailboxConfig from "../config";
import { IArrayById } from "../../infra/collections";
import { getSessionInfo } from "../../App";
import { conversationThreadSelected } from "./threadSelected";
import { IAttachment } from "./messages";
import { Trackers } from "../../infra/tracker";

// TYPE DEFINITIONS -------------------------------------------------------------------------------

export interface IConversationMessage {
  // It's like an IMessage ! LOL !
  id: string; // Message's own id
  parentId: string; // Id of the message that it reply to
  subject: string; // Subject of the message
  body: string; // Content of the message. It's HTML.
  from: string; // User id of the sender
  fromName: string; // Name of the sender
  to: string[]; // User Ids of the receivers
  toName: string[]; // Name of the receivers
  cc: string[]; // User Ids of the copy receivers
  ccName: string[]; // Name of the copy receivers
  displayNames: string[][]; // [0: id, 1: displayName] for each person concerned by this message.
  date: moment.Moment; // DateTime of the message
  threadId: string; // Id of the thread (Id of the first message in this thread).
  unread: boolean; // Self-explaining
  rownum: number; // number of the message in the thread (starting from 1 from the newest to the latest).
  status: ConversationMessageStatus; // sending status of the message
  attachments: Array<IAttachment>;
}

export type IConversationMessageList = IArrayById<IConversationMessage>;
export type IConversationMessageNativeArray = IConversationMessage[]; // Used when th order of received data needs to be kept.

export enum ConversationMessageStatus {
  sent,
  sending,
  failed
}


//--------------------------------------------------------------
export const actionTypeMessageSendRequested = mailboxConfig.createActionType("SEND_REQUESTED");
export const actionTypeMessageSent = mailboxConfig.createActionType("SEND_OK");
export const actionTypeMessageSendError = mailboxConfig.createActionType("SEND_FAILURE");

export function sendMessage(data: IConversationMessage) {
  return async (dispatch, getState) => {
    const newuuid = "tmp-" + generateUuid();
    const fulldata = {
      ...data,
      date: moment(),
      from: getSessionInfo().userId,
      id: newuuid,
      status: ConversationMessageStatus.sending
    };

    dispatch({
      data: fulldata,
      type: actionTypeMessageSendRequested
    });

    try {
      let replyTo = "";
      if (fulldata.parentId) {
        replyTo = "In-Reply-To=" + fulldata.parentId;
      }

      const requestbody = {
        body: fulldata.body,
        cc: fulldata.cc,
        subject: fulldata.subject,
        to: fulldata.to
      };

      if (!Conf.currentPlatform) throw new Error("must specify a platform");
      const response = await signedFetch(
        `${(Conf.currentPlatform as any).url}${mailboxConfig.appInfo.prefix}/send?${replyTo}`,
        {
          body: JSON.stringify(requestbody),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST"
        }
      );

      const json = await response.json();

      const fulldata2 = {
        ...fulldata,
        date: moment(),
        from: getSessionInfo().userId,
        newId: json.id,
        oldId: newuuid,
        parentId: fulldata.parentId,
        threadId: fulldata.threadId
      };

      dispatch({
        data: fulldata2,
        type: actionTypeMessageSent
      });
      
      fulldata2.threadId.startsWith("tmp-") && dispatch(conversationThreadSelected(fulldata2.newId));

      Trackers.trackEvent("Conversation", "SEND");
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.warn(e);
      dispatch({
        data: {
          ...data,
          oldId: newuuid,
          conversation: data.parentId,
          date: Date.now(),
          from: getSessionInfo().userId,
          threadId: data.threadId
        },
        type: actionTypeMessageSendError
      });
    }
  };
}
