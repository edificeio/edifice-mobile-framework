import { appsInfoActionTypes, FetchSuccessAction, HydratePreferencesAction, UpdateFavoritesAction } from './action-types';

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
  showAllApps: false,
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
  [appsInfoActionTypes.toggleAllApps]: state => ({
    ...state,
    showAllApps: !state.showAllApps,
  }),
  [appsInfoActionTypes.hydratePreferences]: (state, action) => {
    const { payload } = action as HydratePreferencesAction;
    return {
      ...state,
      showAllApps: payload.showAllApps,
    };
  },
});

Reducers.register(moduleConfig.reducerName, reducer);

export default reducer;
