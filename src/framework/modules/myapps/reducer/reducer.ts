import { appsInfoActionTypes, FetchErrorAction, FetchSuccessAction } from './actions';

import { Reducers } from '~/app/store';
import moduleConfig from '~/framework/modules/myapps/module-config';
import { AppsInfoState } from '~/framework/modules/myapps/types';
import createReducer from '~/framework/util/redux/reducerFactory';

export const appsInfoInitialState: AppsInfoState = {
  appsConfig: [],
  appsInfo: [],
  entcoreApps: [],
  loading: false,
};

const reducer = createReducer(appsInfoInitialState, {
  [appsInfoActionTypes.fetchStart]: state => {
    return {
      ...state,
      error: undefined,
      loading: true,
    };
  },

  [appsInfoActionTypes.fetchSuccess]: (state, action) => {
    const { appsConfig, appsInfo, entcoreApps } = (action as unknown as FetchSuccessAction).payload;

    return {
      ...state,
      appsConfig,
      appsInfo,
      entcoreApps,
      loading: false,
    };
  },

  [appsInfoActionTypes.fetchError]: (state, action) => {
    const { error } = action as unknown as FetchErrorAction;

    return {
      ...state,
      error,
      loading: false,
    };
  },
});

Reducers.register(moduleConfig.reducerName, reducer);

export default reducer;
