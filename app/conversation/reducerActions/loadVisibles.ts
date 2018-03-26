export const LOAD_VISIBLES_CONVERSATION = (state, action) => { console.log(action); return ({
    ...state,
    visibles: [ ...action.visibles]
}) }