import { IGroup, IUser } from "../../user/reducers";

export const pickUser = dispatch => (user: IUser | IGroup) => {
  dispatch({
    type: "PICK_USER_CONVERSATION",
    user
  });
};

export const unpickUser = dispatch => (user: IUser | IGroup) => {
  dispatch({
    type: "UNPICK_USER_CONVERSATION",
    user
  });
};

export const clearPickedUsers = dispatch => () => {
  dispatch({
    type: "CLEAR_PICKED_USER_CONVERSATION"
  });
};
