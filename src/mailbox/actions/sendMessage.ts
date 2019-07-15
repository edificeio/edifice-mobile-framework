import moment from "moment";
import generateUuid from "../../utils/uuid";

import Conf from "../../../ode-framework-conf";
import { signedFetch } from "../../infra/fetchWithCache";
import Tracking from "../../tracking/TrackingManager";

import mailboxConfig from "../config";
import { IArrayById } from "../../infra/collections";
import { getSessionInfo } from "../../AppStore";

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
    // console.log(getState().mailbox);
    // console.log("1/ trigger send message", data);
    const newuuid = "tmp-" + generateUuid();
    // console.log("uuid:", newuuid);
    const fulldata = {
      ...data,
      date: moment(),
      from: getSessionInfo().userId,
      id: newuuid,
      status: ConversationMessageStatus.sending
    };
    // console.log("uuid 2e démarque:", newuuid);
    // console.log("2/ dispatch sent message requested", fulldata);
    dispatch({
      data: fulldata,
      type: actionTypeMessageSendRequested
    });
    // console.log(getState().mailbox);

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
      // console.log("3/ sent request to the server", requestbody, replyTo);
      if (!Conf.currentPlatform) throw new Error("must specify a platform");
      const response = await signedFetch(
        `${Conf.currentPlatform.url}/conversation/send?${replyTo}`,
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
      // console.log("4/ server response :", json);

      Tracking.logEvent("sentMessage", {
        length: fulldata.body.length - 9,
        nbRecipients: fulldata.to.length + (fulldata.cc || []).length
      });
      const fulldata2 = {
        ...fulldata,
        date: moment(),
        from: getSessionInfo().userId,
        newId: json.id,
        oldId: newuuid,
        parentId: fulldata.parentId,
        threadId: fulldata.threadId
      };
      // console.log("6/ dispatch sent message :", fulldata2);
      dispatch({
        data: fulldata2,
        type: actionTypeMessageSent
      });
      // console.log("7/ Ok :", getState().mailbox);
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
