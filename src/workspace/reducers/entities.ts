/**
 * Workspace state reducer
 * Holds a list of available homework diary Ids in a simple Array
 */
import asyncReducer from "../../infra/redux/async";

import { actionTypes } from "../actions/list"
import { IEntityArray } from "../types/entity";

const stateDefault: IEntityArray = {};

const entitiesListReducer = (
  state: IEntityArray = stateDefault,
  action: any
) => {
  switch (action.type) {
    case actionTypes.received:
      return action.data;
    default:
      return state;
  }
};

export default asyncReducer<IEntityArray>(
  entitiesListReducer,
  actionTypes
);

