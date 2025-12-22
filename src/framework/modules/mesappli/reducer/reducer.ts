import { appsInfoActionTypes, FetchErrorAction, FetchSuccessAction } from './actions';

import { Reducers } from '~/app/store';
import moduleConfig from '~/framework/modules/mesappli/module-config';
import { AppsInfoState } from '~/framework/modules/mesappli/types';
import createReducer from '~/framework/util/redux/reducerFactory';

export const appsInfoInitialState: AppsInfoState = {
  appsConfig: [],
  appsInfo: [],
  loading: false,
};

const reducer = createReducer(appsInfoInitialState, {
  [appsInfoActionTypes.fetchStart]: state => {
    console.debug('[mesappli reducer] FETCH_START', {
      prevState: state,
    });

    return {
      ...state,
      error: undefined,
      loading: true,
    };
  },

  [appsInfoActionTypes.fetchSuccess]: (state, action) => {
    const { appsConfig, appsInfo } = (action as unknown as FetchSuccessAction).payload;

    console.debug('[mesappli reducer] FETCH_SUCCESS', {
      appsConfigCount: appsConfig.length,
      appsInfoCount: appsInfo.length,
      appsInfoSample: appsInfo.slice(0, 3),
      prevState: state,
    });

    return {
      ...state,
      appsConfig,
      appsInfo,
      loading: false,
    };
  },

  [appsInfoActionTypes.fetchError]: (state, action) => {
    const { error } = action as unknown as FetchErrorAction;

    console.error('[mesappli reducer] FETCH_ERROR', error);

    return {
      ...state,
      error,
      loading: false,
    };
  },
});

Reducers.register(moduleConfig.reducerName, reducer);

export default reducer;
