import { Dispatch } from 'redux';

import { notifierActionTypes, NotifierType } from './reducer';

export const notifierHideAction = id => ({
  id,
  type: notifierActionTypes.hide,
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
      duration: opts.duration,
      icon: opts.icon,
      id: opts.id,
      loading: opts.loading,
      notifierType: opts.type,
      text: opts.text,
      type: notifierActionTypes.show,
    });
  };
};
