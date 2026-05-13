import { appsInfoActionTypes, FetchSuccessAction, UpdateFavoritesAction } from './action-types';

import { Reducers } from '~/app/store';
import moduleConfig from '~/framework/modules/myapps/module-config';
import { AppsInfoState } from '~/framework/modules/myapps/types';
import createReducer from '~/framework/util/redux/reducerFactory';

export const appsInfoInitialState: AppsInfoState = {
  aggregatedApps: {},
  appsConfig: [],
  appsInfo: [],
  favorites: {
    applications: [],
    bookmarks: [],
  },
};

const reducer = createReducer(appsInfoInitialState, {
  [appsInfoActionTypes.fetchSuccess]: (state, action) => {
    const { aggregatedApps, appsConfig, appsInfo, favorites } = (action as FetchSuccessAction).payload;
    return {
      ...state,
      aggregatedApps,
      appsConfig,
      appsInfo,
      favorites,
    };
  },
  [appsInfoActionTypes.updateFavorites]: (state, action) => {
    const { bookmarks } = action as UpdateFavoritesAction;

    const updatedAggregatedApps = Object.fromEntries(
      Object.entries(state.aggregatedApps).map(([key, app]) => [
        key,
        {
          ...app,
          isFavorite: bookmarks.includes(app.name),
        },
      ]),
    );

    return {
      ...state,
      aggregatedApps: updatedAggregatedApps,
      favorites: {
        ...state.favorites,
        bookmarks,
      },
    };
  },
});

Reducers.register(moduleConfig.reducerName, reducer);

export default reducer;
