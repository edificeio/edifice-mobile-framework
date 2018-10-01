import { Conf } from "../../Conf";
import { Me } from "../../infra/Me";
import { Tracking } from "../../tracking/TrackingManager";
import { Message } from "../interfaces";
import { signedFetch } from "../../infra/fetchWithCache";

export const sendMessage = dispatch => async (data: Message) => {
  data.id = Math.random().toString();
  dispatch({
    type: "CONVERSATION_SEND",
    data: {
      ...data,
      conversation: data.parentId,
      from: Me.session.userId,
      date: Date.now()
    }
  });

  try {
    let replyTo = "";
    if (data.parentId) {
      replyTo = "In-Reply-To=" + data.parentId;
    }
    const response = await signedFetch(
      `${Conf.platform}/conversation/send?${replyTo}`,
      {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          body: data.body,
          to: data.to,
          cc: data.cc,
          subject: data.subject
        })
      }
    );
    console.log(response);
    let json = await response.json();

    Tracking.logEvent("sentMessage", {
      application: "conversation",
      length: data.body.length - 9,
      nbRecipients: data.to.length + (data.cc || []).length
    });

    dispatch({
      type: "CONVERSATION_SENT",
      data: {
        ...data,
        conversation: data.parentId,
        from: Me.session.userId,
        thread_id: data.thread_id,
        date: Date.now(),
        newId: json.id
      }
    });
  } catch (e) {
    console.log(e);
    dispatch({
      type: "CONVERSATION_FAILED_SEND",
      data: {
        ...data,
        conversation: data.parentId,
        from: Me.session.userId,
        thread_id: data.thread_id,
        date: Date.now()
      }
    });
  }
};
