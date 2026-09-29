import { IGlobalState } from '~/app/store';
import moduleConfig from '~/framework/modules/user/module-config';
import createReducer from '~/framework/util/redux/reducerFactory';

// State type

export interface UserState {}

// Initial state value

export const initialState: UserState = {};

// Actions definitions

export const actionTypes = {};

export interface ActionPayloads {}

export const actions = {};

// Reducer

const reducer = createReducer(initialState, {});

// State getters

export const getState = (state: IGlobalState) => state[moduleConfig.reducerName] as UserState;

// Register the reducer

export default reducer;
