import { IGlobalState, Reducers } from '~/app/store';
import moduleConfig from '~/framework/modules/user/module-config';
import createReducer from '~/framework/util/redux/reducerFactory';

// State type

export interface UserState {
  xmasTheme: boolean;
  flakesFalling: boolean;
}

// Initial state value

export const initialState: UserState = {
  xmasTheme: true,
  flakesFalling: false,
};

// Actions definitions

export const actionTypes = {
  toggleXmasTheme: moduleConfig.namespaceActionType('TOGGLE_XMAS_THEME'),
  setFlakes: moduleConfig.namespaceActionType('SET_FLAKES'),
};

export interface ActionPayloads {}

export const actions = {};

// Reducer

const reducer = createReducer(initialState, {
  [actionTypes.toggleXmasTheme]: (state, action) => {
    return { ...initialState, xmasTheme: action.value };
  },
  [actionTypes.setFlakes]: (state, action) => {
    return { ...initialState, flakesFalling: action.value };
  },
});

// State getters

export const getState = (state: IGlobalState) => state[moduleConfig.reducerName] as UserState;

// Register the reducer

Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
