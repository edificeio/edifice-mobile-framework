/**
 * Workspace state reducer
 * Holds a list of available homework diary Ids in a simple Array
 */
import { Reducer } from "redux";
import asyncReducer, { IAction } from "../../infra/redux/async";

import { actionTypes } from "../actions/list"
import { IState } from "../types";

const stateDefault: IState = {};

const itemsReducer: Reducer<IState, IAction<any>> = (
  state: IState = stateDefault,
  action: IAction<any>
) => {
  switch (action.type) {
    case actionTypes.received:
      return {
        ...state,
        [action.id]: action.data
      };
    default:
      return state;
  }
};

export default asyncReducer<IState>(
  itemsReducer,
  actionTypes
)

