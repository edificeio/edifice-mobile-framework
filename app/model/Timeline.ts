export const Timeline = (state = {
    isFetching: false,
    didInvalidate: false,
    news: []
  }, action) => {
    switch (action.type) {
      case 'UPDATE':
        return {
          ...state,
          didInvalidate: false,
          news: action.news
        }
      default:
        return state
    }
  }
  