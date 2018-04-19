export const INVALIDATE_TIMELINE = (state, action) => ({
    ...state,
    refresh: true,
    endReached: false,
    isFetching: false,
    news: []
});