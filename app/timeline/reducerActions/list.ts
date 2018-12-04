export const APPEND_TIMELINE = (state, action) => ({
  ...state,
  news: [
    ...state.news,
    ...action.news.filter(
      n => state.news.find(n2 => n2.id === n.id) === undefined
    )
  ],
  isFetching: false
});

export const FETCH_NEW_TIMELINE = (state, action) => ({
  ...state,
  news: [
    ...action.news.filter(
      e => state.news.find(n => n.id === e.id) === undefined
    ),
    ...state.news
  ],
  isFetching: false
});

export const END_REACHED_TIMELINE = (state, action) => ({
  ...state,
  news: [...state.news],
  endReached: true,
  isFetching: false
});

export const FETCH_TIMELINE = (state, action) => ({
  ...state,
  isFetching: true,
  refresh: false,
  endReached: false,
  fetchFailed: false
});

export const FAILED_LOAD_TIMELINE = (state, action) => ({
  ...state,
  isFetching: false,
  endReached: true,
  fetchFailed: true
});
