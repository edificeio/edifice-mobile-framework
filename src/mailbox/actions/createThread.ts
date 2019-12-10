import { IGroup, IUser } from "../../user/reducers";

import mailboxConf from "../config";

import { fetchJSONWithCache } from "../../infra/fetchWithCache";
import { clearPickedUsers } from "./pickUser";
import conversationThreadSelected from "./threadSelected";

import { getSessionInfo } from "../../AppStore";

import I18n from "i18n-js";

export const actionTypeThreadCreated = mailboxConf.createActionType(
  "THREAD_CREATED"
);

export function createThread(pickedUsers) {
  return (dispatch, getState) => {
    const newThread = {
      date: Date.now(),
      displayNames: pickedUsers.map((u: any) => [
        u.id,
        u.displayName || u.name,
        u.isGroup
      ]).concat([[getSessionInfo().userId, getSessionInfo().displayName]]),
      from: getSessionInfo().userId,
      id: "temp",
      messages: [],
      subject:
        I18n.t("conversation-newThreadSubjectPrefix") + 
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
    dispatch(conversationThreadSelected(newThread.id));

    return newThread;
  };
}

export const actionTypeLoadVisibles = mailboxConf.createActionType(
  "LOAD_VISIBLES"
);

export const loadVisibles = dispatch => async () => {
  const visibles = await fetchJSONWithCache(`/conversation/visible`);
  const groups = visibles && visibles.groups.map(group => ({
    ...group,
    isGroup: true
  }))
  const users = visibles && visibles.users.map(user => ({
    ...user,
    isGroup: false
  }))

  dispatch({
    type: actionTypeLoadVisibles,
    visibles: [...groups, ...users]
  });
};
