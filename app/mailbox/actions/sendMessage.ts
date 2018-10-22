import moment from "moment";
import generateUuid from "../../utils/uuid";

import { Conf } from "../../Conf";
import { signedFetch } from "../../infra/fetchWithCache";
import { Me } from "../../infra/Me";
import { Tracking } from "../../tracking/TrackingManager";
import {
  ConversationMessageStatus,
  IConversationMessage
} from "../reducers/messages";

export const actionTypeMessageSendRequested = "CONVERSATION_SEND_REQUESTED";
export const actionTypeMessageSent = "CONVERSATION_SEND_OK";
export const actionTypeMessageSendError = "CONVERSATION_MESSAGE_FAILED_SEND";

export const sendMessage = dispatch => async (data: IConversationMessage) => {
  const uuid = generateUuid();
  dispatch({
    data: {
      ...data,
      date: moment(),
      from: Me.session.userId,
      id: uuid,
      status: ConversationMessageStatus.sending
    },
    type: actionTypeMessageSendRequested
  });

  try {
    let replyTo = "";
    if (data.parentId) {
      replyTo = "In-Reply-To=" + data.parentId;
    }
    const response = await signedFetch(
      `${Conf.platform}/conversation/send?${replyTo}`,
      {
        body: JSON.stringify({
          body: data.body,
          cc: data.cc,
          subject: data.subject,
          to: data.to
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST"
      }
    );
    console.log("message send:", response);
    const json = await response.json();

    Tracking.logEvent("sentMessage", {
      application: "conversation",
      length: data.body.length - 9,
      nbRecipients: data.to.length + (data.cc || []).length
    });

    dispatch({
      data: {
        ...data,
        conversation: data.parentId,
        date: moment(),
        from: Me.session.userId,
        newId: json.id,
        oldId: uuid,
        threadId: data.threadId
      },
      type: actionTypeMessageSent
    });
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.warn(e);
    dispatch({
      data: {
        ...data,
        conversation: data.parentId,
        date: Date.now(),
        from: Me.session.userId,
        threadId: data.threadId
      },
      type: actionTypeMessageSendError
    });
  }
};
