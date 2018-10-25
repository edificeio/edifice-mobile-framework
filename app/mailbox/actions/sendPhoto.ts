import { Conf } from "../../Conf";
import { Me } from "../../infra/Me";

import { takePhoto, uploadImage } from "../../infra/actions/workspace";
import { signedFetch } from "../../infra/fetchWithCache";
import { IConversationMessage } from "../reducers/messages";

export const sendPhoto = dispatch => async (data: IConversationMessage) => {
  const uri = await takePhoto();

  dispatch({
    data: {
      ...data,
      body: `<div><img src="${uri}" /></div>`,
      conversation: data.parentId,
      date: Date.now(),
      from: Me.session.userId
    },
    type: "CONVERSATION_SEND"
  });

  try {
    const documentPath = await uploadImage(uri);
    const body = `<div><img src="${documentPath}" /></div>`;

    let replyTo = "";
    if (data.parentId) {
      replyTo = "In-Reply-To=" + data.parentId;
    }

    const response = await signedFetch(
      `${Conf.platform}/conversation/send?${replyTo}`,
      {
        body: JSON.stringify({
          body,
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
    const json = await response.json();

    dispatch({
      data: {
        ...data,
        body,
        conversation: data.parentId,
        date: Date.now(),
        from: Me.session.userId,
        newId: json.id
      },
      type: "CONVERSATION_SENT"
    });
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.warn(e);
    dispatch({
      body: "<div></div>",
      conversation: data.parentId,
      data,
      date: Date.now(),
      from: Me.session.userId,
      type: "CONVERSATION_FAILED_SEND"
    });
  }
};
