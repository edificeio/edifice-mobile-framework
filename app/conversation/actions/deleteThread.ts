import { Conf } from "../../Conf";
import { Thread } from "../interfaces";
import { signedFetch } from "../../infra/fetchWithCache";

export const deleteThread = dispatch => async (conversation: Thread) => {
  dispatch({
    type: "DELETE_THREAD_CONVERSATION",
    data: { conversationId: conversation.id }
  });

  try {
    for (let i = 0; i < conversation.messages.length; i++) {
      signedFetch(
        `${Conf.platform}/conversation/trash?id=${conversation.messages[i].id}`,
        { method: "put" }
      )
        .then(r => console.log(r))
        .catch(e => console.log(e));
    }
  } catch (e) {
    console.log(e);
  }
};
