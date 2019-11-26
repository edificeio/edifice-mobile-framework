/**
 * Workspace state reducer
 * Holds a list of available homework diary Ids in a simple Array
 */
import { Reducer } from "redux";
import asyncReducer, { IAction } from "../../infra/redux/async";

import { actionTypesList } from "../actions/list"
import {FilterId, IState} from "../types";
import {actionTypesAdd} from "../actions/add";

const stateDefault: IState = {};

const itemsReducer: Reducer<IState, IAction<any>> = (
  state: IState = stateDefault,
  action: IAction<any>
) => {
  return {
    ...state,
    [action.id || FilterId.root]: node(state[action.id || FilterId.root], action)
  }
};

export default asyncReducer<IState>(
  itemsReducer,
  actionTypesList
)

const node = (state:any, action:IAction<any>) => {
  switch (action.type) {
    case actionTypesList.received:
      return action.data
    case actionTypesAdd.received:
      return {
        ...state,
        ...action.data
      }
    default:
      return state
  }
}
