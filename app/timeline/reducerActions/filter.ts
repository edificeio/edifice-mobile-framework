export const PICK_FILTER_TIMELINE = (state, action) => ({
    ...state,
    selectedApps: action.selectedApps
});

export const FILTER_TIMELINE = (state, action) => ({
    ...state,
    news: [],
    availableApps: action.availableApps
});