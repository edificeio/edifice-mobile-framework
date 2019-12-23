import { Dispatch } from "redux";
import { NotifierType, notifierActionTypes } from "./state";

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
