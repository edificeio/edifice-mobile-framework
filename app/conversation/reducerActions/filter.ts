export const CLEAR_FILTER_CONVERSATION = (state) => ({
    ...state,
    filterCleared: true,
    filterCriteria: ''
});

export const FILTER_CONVERSATION = (state, action) => ({
    ...state,
    filterCleared: true,
    filterCriteria: action.filter
});