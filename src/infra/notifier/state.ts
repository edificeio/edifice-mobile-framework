// State type

export type NotifierType = 'info' | 'success' | 'warning' | 'error';

export interface NotifierState {
  notifierType: NotifierType,
  text?: string,
  icon?: string,
  loading?: boolean;
  visible: boolean;
}

// Initial state

export const initialState: NotifierState = {
  notifierType: 'info',
  visible: false
};

// Action types

export const notifierActionTypes = {
  show: "NOTIFIER_SHOW",
  hide: "NOTIFIER_HIDE"
};