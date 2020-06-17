import { Dispatch } from "redux";

import { selectChildActionType, IChild } from "../state/children";

// ACTION LIST ------------------------------------------------------------------------------------

export const selectChild = (child: IChild) => ({ type: selectChildActionType, selectedChild: child });

// THUNKS -----------------------------------------------------------------------------------------

export function selectChildAction(child: IChild) {
  return async (dispatch: Dispatch) => {
    dispatch(selectChild(child));
  };
}
