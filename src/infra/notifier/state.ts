// State type
export type NotifierType = 'info' | 'success' | 'warning' | 'error';
export interface NotifierState {
  notifierType: NotifierType,
  visible: boolean;
  text?: string,
  icon?: string,
  loading?: boolean;
  duration?: number;
}

// Initial state
export const initialState = {};

// Action types
export const notifierActionTypes = {
  show: "NOTIFIER_SHOW",
  hide: "NOTIFIER_HIDE"
};
