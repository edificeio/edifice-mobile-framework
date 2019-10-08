/**
 * Workspace state reducer
 * Holds a list of available homework diary Ids in a simple Array
 */
import asyncReducer from "../../infra/redux/async";

import { actionTypes } from "../actions/documents"
import { IWorkspaceDocumentArray } from "../types";

const stateDefault: IWorkspaceDocumentArray = {};

const documentsListReducer = (
  state: IWorkspaceDocumentArray = stateDefault,
  action
) => {
  switch (action.type) {
    case actionTypes.received:
      return action.data;
    default:
      return state;
  }
};

export default asyncReducer<IWorkspaceDocumentArray>(
  documentsListReducer,
  actionTypes
);

