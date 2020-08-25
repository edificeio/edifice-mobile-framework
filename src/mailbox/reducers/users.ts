import { actionTypeLoadVisibles } from "../actions/createThread";
import { actionTypeUserPick, actionTypeUserUnpick, actionTypeUserClearPicks } from "../actions/pickUser";
import { AnyAction } from "redux";
import { createEndSessionActionType } from "../../infra/redux/reducerFactory";

/**
 * Manage the selected users in mailbox.
 */

export interface IMailBoxUsersState {
  picked: any[];
  remaining: any[];
  visibles: any[];
}

const defaultState: IMailBoxUsersState = {
  picked: [],
  remaining: [],
  visibles: []
};

export default function selectedThread(
  state: IMailBoxUsersState = defaultState,
  action: AnyAction
) {
  const actionUserId = action.user && action.user.userId || action.user && action.user.id;
  switch (action.type) {
    case actionTypeLoadVisibles:
      return {
        ...state,
        remaining: [...action.visibles]
          .filter(visible => !state.picked.some(picked => picked.userId === visible.id)),
        visibles: [...action.visibles]
      };
    case actionTypeUserPick:
      return {
        ...state,
        picked: [{ ...action.user, checked: true }, ...state.picked],
        remaining: state.remaining
          .filter(u => u.userId !== actionUserId)
          .filter(u => u.id !== actionUserId)
      };
    case actionTypeUserUnpick:
      return {
        ...state,
        picked: state.picked
          .filter(u => u.userId !== actionUserId)
          .filter(u => u.id !== actionUserId),
        remaining: [{ ...action.user, checked: false }, ...state.remaining]
      };
    case actionTypeUserClearPicks:
      return {
        ...state,
        picked: [],
        remaining: state.visibles
      };
    // Session flush forward-compatibility.
    case createEndSessionActionType():
      return defaultState;
    default:
      return state;
  }
}
