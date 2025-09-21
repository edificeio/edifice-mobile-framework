import { CantineData } from '../model';
import moduleConfig from '../module-config';

import { IGlobalState, Reducers } from '~/app/store';
import createReducer from '~/framework/util/redux/reducerFactory';

// State type
export interface CantineState {
  // Cache key format: `${structureUAI}-${date}`
  cache: Record<string, CantineData>;
  // Track which cache keys had empty data (so we can retry them)
  // Empty results and errors are not cached to allow retrying when user returns to that date
  emptyResults: Record<string, boolean>;
}

// Initial state value
export const initialState: CantineState = {
  cache: {},
  emptyResults: {},
};

// Actions definitions
export const actionTypes = {
  clearCache: moduleConfig.namespaceActionType('CLEAR_CACHE'),
  setData: moduleConfig.namespaceActionType('SET_DATA'),
  setEmptyResult: moduleConfig.namespaceActionType('SET_EMPTY_RESULT'),
};

export interface ActionPayloads {
  clearCache: void;
  setData: { data: CantineData; key: string };
  setEmptyResult: { key: string };
}

// Union type for all actions
export type CantineAction = { data: CantineData; key: string; type: string } | { key: string; type: string } | { type: string };

// Action creators
export const actions = {
  clearCache: () => ({
    type: actionTypes.clearCache,
  }),
  setData: (key: string, data: CantineData) => ({
    data,
    key,
    type: actionTypes.setData,
  }),
  setEmptyResult: (key: string) => ({
    key,
    type: actionTypes.setEmptyResult,
  }),
};

// Reducer
const reducer = createReducer(initialState, {
  [actionTypes.clearCache]: () => initialState,
  [actionTypes.setData]: (state, action: any) => ({
    ...state,
    cache: {
      ...state.cache,
      [action.key]: action.data,
    },
    emptyResults: {
      ...state.emptyResults,
      [action.key]: false,
    },
  }),
  [actionTypes.setEmptyResult]: (state, action: any) => ({
    ...state,
    emptyResults: {
      ...state.emptyResults,
      [action.key]: true,
    },
  }),
});

// State getters
export const getState = (state: IGlobalState) => state[moduleConfig.reducerName] as CantineState;

// Helper functions
export const getCacheKey = (structureUAI: string, date: string) => `${structureUAI}-${date}`;

export const getCantineData = (state: IGlobalState, structureUAI: string, date: string) => {
  const cantineState = getState(state);
  const key = getCacheKey(structureUAI, date);
  return cantineState.cache[key] || null;
};

export const getCantineEmptyResult = (state: IGlobalState, structureUAI: string, date: string) => {
  const cantineState = getState(state);
  const key = getCacheKey(structureUAI, date);
  return cantineState.emptyResults[key] || false;
};

export const shouldRetryCantineData = (state: IGlobalState, structureUAI: string, date: string) => {
  const cantineState = getState(state);
  const key = getCacheKey(structureUAI, date);

  // Retry if:
  // 1. No data is cached, OR
  // 2. The previous result was empty (so we don't cache empty results)
  // Errors are treated the same as empty results - not cached at all
  return !cantineState.cache[key] || cantineState.emptyResults[key];
};

// Register the reducer
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
