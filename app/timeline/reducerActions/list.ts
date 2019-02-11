export const APPEND_TIMELINE = (state, action) => ({
  ...state,
  news: action.recent
    ? [
        ...action.news.filter(
          // This filter ignore all news that are already present, to add only the new ones.
          n => state.news.find(n2 => n2.id === n.id) === undefined
        ),
        ...state.news
      ]
    : [
        ...state.news,
        ...action.news.filter(
          // This filter ignore all news that are already present, to add only the new ones.
          n => state.news.find(n2 => n2.id === n.id) === undefined
        )
      ],
  isFetching: false
});

export const FETCH_NEW_TIMELINE = (state, action) => ({
  ...state,
  news: [
    // Here we clear all the news and replacing the content by the news ones
    ...action.news // ,
    // ...state.news
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
