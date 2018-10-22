import { IGroup, IUser } from "../../user/reducers";
import mailboxConfig from "../config";

export const actionTypeUserPick = mailboxConfig.createActionType("USER_PICK");
export const pickUser = dispatch => (user: IUser | IGroup) => {
  dispatch({
    type: actionTypeUserPick,
    user
  });
};

export const actionTypeUserUnpick = mailboxConfig.createActionType("USER_UNPICK");
export const unpickUser = dispatch => (user: IUser | IGroup) => {
  dispatch({
    type: actionTypeUserUnpick,
    user
  });
};

export const actionTypeUserClearPicks = mailboxConfig.createActionType("USER_CLEAR_PICKS");
export const clearPickedUsers = dispatch => () => {
  dispatch({
    type: actionTypeUserClearPicks
  });
};
