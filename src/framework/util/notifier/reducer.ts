import createReducer from '~/framework/util/redux/reducerFactory';

// State type
export type NotifierType = 'info' | 'success' | 'warning' | 'error';
export interface NotifierState {
  notifierType: NotifierType;
  visible: boolean;
  text?: string;
  icon?: string;
  loading?: boolean;
  duration?: number;
}

// Initial state
export const initialState = {};

// Action types
export const notifierActionTypes = {
  show: 'NOTIFIER_SHOW',
  hide: 'NOTIFIER_HIDE',
};

export default createReducer(initialState, {
  [notifierActionTypes.show]: (state, action) => {
    const { id, type, ...actionInfos } = action;
    return {
      ...state,
      [id]: { ...actionInfos, visible: true },
    };
  },
  [notifierActionTypes.hide]: (state, action) => {
    const { id } = action;
    return {
      ...state,
      [id]: { ...state[id], visible: false },
    };
  },
});
