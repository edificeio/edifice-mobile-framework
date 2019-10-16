/**
 * Workspace state reducer
 * Holds a list of available homework diary Ids in a simple Array
 */
import { Reducer } from "redux";
import asyncReducer, { IAction } from "../../infra/redux/async";

import { actionTypes } from "../actions/list"
import { IStateItems } from "../types";

const stateDefault: IStateItems = {};

const itemsReducer: Reducer<IStateItems, IAction<any>> = (
  state: IStateItems = stateDefault,
  action: IAction<any>
) => {
  switch (action.type) {
    case actionTypes.received:
      return {
        ...state,
        [action.id ? action.id : "root"]: action.data
      };
    default:
      return state;
  }
};

export default asyncReducer<IStateItems>(
  itemsReducer,
  actionTypes
)

