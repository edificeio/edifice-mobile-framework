import { Me } from "../../infra/Me";
import { IGroup, IUser } from "../../user/reducers";

export const createConversation = dispatch => pickedUsers => {
  const newConversation = {
    thread_id: "temp",
    to: pickedUsers.map((u: any) => u.id),
    displayNames: pickedUsers.map((u: any) => [u.id, u.displayName || u.name]),
    subject:
      "Discussion avec " +
      pickedUsers
        .map(u => (u as IUser).displayName || (u as IGroup).name)
        .join(", "),
    messages: [],
    from: Me.session.userId,
    nb: 0,
    date: Date.now()
  };

  dispatch({
    type: "OPEN_THREAD_CONVERSATION",
    threadId: "temp"
  });

  dispatch({
    type: "CREATE_THREAD_CONVERSATION",
    newConversation: newConversation
  });

  return newConversation;
};
