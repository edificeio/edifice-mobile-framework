export const CLEAR_TIMELINE = (state, action) => ({
  ...state,
  endReached: false,
  isFetching: false,
  news: []
});
