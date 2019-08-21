import { AnyAction } from "redux";
import { notifierActionTypes, NotifierState } from "./actions";

const initialState: NotifierState = {
  notifierType: 'info',
  visible: false
};

export default (
  state: NotifierState = initialState,
  action: AnyAction
): NotifierState => {
  switch(action.type) {
    case notifierActionTypes.show:
      return {
        ...state,
        ...action,
        visible: true
      };
    case notifierActionTypes.hide:
      return {
        ...state,
        visible: false
      };
    default:
      return state;
  }
};
