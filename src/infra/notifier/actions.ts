import { Dispatch } from 'redux';

import { NotifierType, notifierActionTypes } from './state';

export const notifierHideAction = id => ({
  type: notifierActionTypes.hide,
  id,
});

export const notifierShowAction = (opts: {
  type: NotifierType;
  id: string;
  text?: string;
  icon?: string;
  loading?: boolean;
  persistent?: boolean;
  duration?: number;
}) => {
  return (dispatch: Dispatch) => {
    if (!opts.persistent) {
      setTimeout(() => dispatch(notifierHideAction(opts.id)), opts.duration || 5000);
    }
    dispatch({
      type: notifierActionTypes.show,
      id: opts.id,
      notifierType: opts.type,
      text: opts.text,
      icon: opts.icon,
      loading: opts.loading,
      duration: opts.duration,
    });
  };
};
