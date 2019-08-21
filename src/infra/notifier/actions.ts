import { Dispatch } from "redux";

// Types

export type NotifierType = 'info' | 'success' | 'warning' | 'error';

export interface NotifierState {
  notifierType: NotifierType,
  text?: string,
  icon?: string,
  loading?: boolean;
  visible: boolean;
}

// Action types

export const notifierActionTypes = {
  show: "NOTIFIER_SHOW",
  hide: "NOTIFIER_HIDE"
};

// Action creators

export const notifierShowAction = (opts: {
  text?: string;
  icon?: string;
  loading?: boolean;
  type: NotifierType,
  persistent?: boolean
}) => {
  return (dispatch: Dispatch) => {
    if (!opts.persistent) {
      setTimeout(() => dispatch(notifierHideAction()), 2000);
    }
    dispatch({
      type: notifierActionTypes.show,
      notifierType: opts.type,
      text: opts.text,
      icon: opts.icon,
      loading: opts.loading
    });
  }
}

export const notifierHideAction = () => ({
  type: notifierActionTypes.hide
});
