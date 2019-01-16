import moment from "moment";
import Conf from "../../Conf";
import { Me } from "../../infra/Me";
import Tracking from "../../tracking/TrackingManager";
import generateUuid from "../../utils/uuid";

import { takePhoto, uploadImage } from "../../infra/actions/workspace";
import { signedFetch } from "../../infra/fetchWithCache";
import {
  ConversationMessageStatus,
  IConversationMessage
} from "../reducers/messages";

import {
  actionTypeMessageSendError,
  actionTypeMessageSendRequested,
  actionTypeMessageSent
} from "./sendMessage";

export const sendPhoto = dispatch => async (data: IConversationMessage) => {
  const uri = await takePhoto();

  const newuuid = "tmp-" + generateUuid();

  const fulldata = {
    ...data,
    body: `<div><img src="${uri}" /></div>`,
    date: moment(),
    from: Me.session.userId,
    id: newuuid,
    parentId: data.parentId,
    status: ConversationMessageStatus.sending,
    threadId: data.threadId
  };

  dispatch({
    data: fulldata,
    type: actionTypeMessageSendRequested
  });

  try {
    const documentPath = await uploadImage(uri);
    const body = `<div><img src="${documentPath}" /></div>`;

    let replyTo = "";
    if (fulldata.parentId) {
      replyTo = "In-Reply-To=" + fulldata.parentId;
    }

    const requestBody = {
      body,
      cc: fulldata.cc,
      subject: fulldata.subject,
      to: fulldata.to
    };

    if (!Conf.currentPlatform) throw new Error("must specify a platform");
    const response = await signedFetch(
      `${Conf.currentPlatform.url}/conversation/send?${replyTo}`,
      {
        body: JSON.stringify(requestBody),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        method: "POST"
      }
    );
    const json = await response.json();

    Tracking.logEvent("sentMessage", {
      length: fulldata.body.length - 9,
      nbRecipients: fulldata.to.length + (fulldata.cc || []).length
    });

    const fulldata2 = {
      ...fulldata,
      body,
      date: moment(),
      from: Me.session.userId,
      newId: json.id,
      oldId: newuuid,
      parentId: fulldata.parentId,
      threadId: fulldata.threadId
    };

    dispatch({
      data: fulldata2,
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
