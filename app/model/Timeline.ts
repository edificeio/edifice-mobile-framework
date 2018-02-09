export const Timeline = (state = {
    isFetching: false,
    didInvalidate: false,
    news: [],
    endReached: false
  }, action) => {
    console.log(action)
    switch (action.type) {
      case 'APPEND':
        return {
          ...state,
          didInvalidate: false,
          news: state.news.concat(action.news),
          isFetching: false
        }
      case 'END_REACHED':
        return {
          ...state,
          didInvalidate: false,
          endReached: true,
          isFetching: false
        }
      case 'FETCH':
        return {
          ...state,
          isFetching: true
        }
      case 'RESET':
        return {
          ...state,
          endReached: false,
          isFetching: false,
          news: []
        }
      default:
        return state
    }
  }
  