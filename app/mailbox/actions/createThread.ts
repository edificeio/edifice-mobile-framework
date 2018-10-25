import { Me } from "../../infra/Me";
import { IGroup, IUser } from "../../user/reducers";

import mailboxConf from "../config";

import { fetchJSONWithCache } from "../../infra/fetchWithCache";
import { clearPickedUsers } from "./pickUser";
import conversationThreadSelected from "./threadSelected";

import { navigate } from "../../navigation/helpers/navHelper";

export const actionTypeThreadCreated = mailboxConf.createActionType(
  "THREAD_CREATED"
);

export function createThread(pickedUsers) {
  return (dispatch, getState) => {
    const newThread = {
      date: Date.now(),
      displayNames: pickedUsers.map((u: any) => [
        u.id,
        u.displayName || u.name
      ]),
      from: Me.session.userId,
      id: "temp",
      messages: [],
      subject:
        "Discussion avec " +
        pickedUsers
          .map(u => (u as IUser).displayName || (u as IGroup).name)
          .join(", "),
      to: pickedUsers.map((u: any) => u.id),
      unread: 0
    };

    dispatch({
      newThread,
      type: actionTypeThreadCreated
    });
    clearPickedUsers(dispatch)();
    dispatch(conversationThreadSelected(newThread.id));

    return newThread;
  };
}

export const actionTypeLoadVisibles = mailboxConf.createActionType(
  "LOAD_VISIBLES"
);

export const loadVisibles = dispatch => async () => {
  const visibles = await fetchJSONWithCache(`/conversation/visible`);
  dispatch({
    type: actionTypeLoadVisibles,
    visibles: [...visibles.groups, ...visibles.users]
  });
};
