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


const node = (state:any, action:IAction<any>) => {
  switch (action.type) {
    case actionTypesList.received:
      return action.data;
    case actionTypesAdd.received:
      return {
        ...state,
        ...action.data
      };
    default:
      return state
  }
};


const itemsReducer: Reducer<IState, IAction<any>> = (
  state: IState = stateDefault,
  action: IAction<any>
) => {
  switch (action.type) {
    case actionTypesList.fetchError:
    case actionTypesList.requested:
    case actionTypesList.received:
    case actionTypesAdd.fetchError:
    case actionTypesAdd.requested:
    case actionTypesAdd.received:
      return {
        ...state,
        [action.id || FilterId.root]: asyncReducer<IState>(node, actionTypesList)(state[action.id || FilterId.root] || {}, action)
      };
    default:
      return state;
  }
};

export default itemsReducer;
