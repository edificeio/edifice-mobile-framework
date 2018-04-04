import { Group, User } from "../../model/Auth";

export const pickUser = dispatch => (user: User | Group) => {
    dispatch({
        type: 'PICK_USER_CONVERSATION',
        user: user
    })
}

export const unpickUser = dispatch => (user: User | Group) => {
    dispatch({
        type: 'UNPICK_USER_CONVERSATION',
        user: user
    })
}

export const clearPickedUsers = dispatch => () => {
    dispatch({
        type: 'CLEAR_PICKED_USER_CONVERSATION'
    })
}