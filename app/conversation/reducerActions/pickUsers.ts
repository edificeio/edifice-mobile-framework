export const LOAD_VISIBLES_CONVERSATION = (state, action) => ({
    ...state,
    visibles: [ ...action.visibles],
    remainingUsers: [...action.visibles]
});

export const PICK_USER_CONVERSATION = (state, action) => ({
    ...state,
    pickedUsers: [{ ...action.user, checked: true }, ...state.pickedUsers],
    remainingUsers: state.remainingUsers.filter(u => u.id !== action.user.id)
});

export const UNPICK_USER_CONVERSATION = (state, action) => ({
    ...state,
    pickedUsers: state.pickedUsers.filter(u => u.id !== action.user.id),
    remainingUsers: [{ ...action.user, checked: false }, ...state.remainingUsers]
});

export const CLEAR_PICKED_USER_CONVERSATION = (state, action) => ({
    ...state,
    pickedUsers: [],
    remainingUsers: state.visibles
});