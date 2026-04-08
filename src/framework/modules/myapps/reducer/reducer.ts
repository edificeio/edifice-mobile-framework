import {
  appsInfoActionTypes,
  FetchErrorAction,
  FetchSuccessAction,
  HydratePreferencesAction,
  SaveGroupedFavoritesSuccessAction,
  ToggleFavoriteAction,
} from './action-types';
import { computeNextBookmarks } from './adapter';

import { Reducers } from '~/app/store';
import moduleConfig from '~/framework/modules/myapps/module-config';
import { AppsInfoState } from '~/framework/modules/myapps/types';
import createReducer from '~/framework/util/redux/reducerFactory';

export const appsInfoInitialState: AppsInfoState = {
  aggregatedApps: [],
  appsConfig: [],
  appsInfo: [],
  favorites: {
    applications: [],
    bookmarks: [],
  },
  isSavingFavorites: false,
  loading: false,
  showAllApps: false,
};

const reducer = createReducer(appsInfoInitialState, {
  [appsInfoActionTypes.fetchStart]: state => ({
    ...state,
    error: undefined,
    loading: true,
  }),
  [appsInfoActionTypes.fetchSuccess]: (state, action) => {
    const { aggregatedApps, appsConfig, appsInfo, favorites } = (action as FetchSuccessAction).payload;
    return {
      ...state,
      aggregatedApps,
      appsConfig,
      appsInfo,
      favorites,
      loading: false,
    };
  },
  [appsInfoActionTypes.fetchError]: (state, action) => ({
    ...state,
    error: (action as FetchErrorAction).error,
    loading: false,
  }),
  [appsInfoActionTypes.toggleFavorite]: (state, action) => {
    const { appName } = action as ToggleFavoriteAction;
    const nextBookmarks = computeNextBookmarks(state.favorites.bookmarks, appName);
    const nextFavorites = { ...state.favorites, bookmarks: nextBookmarks };
    return {
      ...state,
      aggregatedApps: state.aggregatedApps.map(app => ({
        ...app,
        isFavorite: nextBookmarks.includes(app.name),
      })),
      favorites: nextFavorites,
    };
  },
  [appsInfoActionTypes.saveGroupedFavoritesStart]: state => ({
    ...state,
    isSavingFavorites: true,
  }),
  [appsInfoActionTypes.saveGroupedFavoritesSuccess]: (state, action) => {
    const { bookmarks } = action as SaveGroupedFavoritesSuccessAction;
    return {
      ...state,
      favorites: {
        ...state.favorites,
        bookmarks,
      },
      isSavingFavorites: false,
    };
  },
  [appsInfoActionTypes.saveGroupedFavoritesError]: state => ({
    ...state,
    isSavingFavorites: false,
  }),
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
