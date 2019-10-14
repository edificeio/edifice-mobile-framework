/**
 * Workspace state reducer
 * Holds a list of available homework diary Ids in a simple Array
 */
import { Reducer } from "redux";
import asyncReducer, { IAction } from "../../infra/redux/async";

import { actionTypes } from "../actions/list"
import { IStateWorkspace } from "../types/entity";

const stateDefault: IStateWorkspace = {};

const entitiesListReducer: Reducer<IStateWorkspace, IAction<any>> = (
  state: IStateWorkspace = stateDefault,
  action: IAction<any>
) => {
  switch (action.type) {
    case actionTypes.received:
      return {
        ...state,
        [action.id ? action.id : "root"]: action.data
      }
    default:
      return state;
  }
};

export default asyncReducer<IStateWorkspace>(
  entitiesListReducer,
  actionTypes
)

